import { NextResponse, NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/helpers/prisma/prisma';
import { getCurrentUser } from '@/helpers/auth/currentUser';
import { getDictionary } from '@/helpers/i18n/locale';

const MAX_REASON_LENGTH = 300;

export async function POST(req: NextRequest) {
  const t = getDictionary();
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: t.errSignInToReport }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const reviewId = body?.reviewId;
  const reason = typeof body?.reason === 'string' ? body.reason.trim().slice(0, MAX_REASON_LENGTH) : '';
  if (typeof reviewId !== 'number' || !Number.isInteger(reviewId)) {
    return NextResponse.json({ error: t.errBadBody }, { status: 400 });
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review || review.hidden) {
    return NextResponse.json({ error: t.errReviewNotFound }, { status: 404 });
  }

  try {
    await prisma.reviewReport.create({
      data: { reviewId, userId: user.id, reason: reason || null }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: t.errAlreadyReported }, { status: 409 });
    }
    console.error('Failed to report review:', error);
    return NextResponse.json({ error: t.reportFailed }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
