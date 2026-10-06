import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/helpers/prisma/prisma';
import { getCurrentUser } from '@/helpers/auth/currentUser';

// admin actions on a reported review: hide it, show it again, or clear its reports
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const reviewId = body?.reviewId;
  const action = body?.action;
  if (typeof reviewId !== 'number' || !['hide', 'unhide', 'dismiss'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (action === 'dismiss') {
    await prisma.reviewReport.deleteMany({ where: { reviewId } });
  } else {
    await prisma.review.update({ where: { id: reviewId }, data: { hidden: action === 'hide' } });
  }
  return NextResponse.json({ ok: true });
}
