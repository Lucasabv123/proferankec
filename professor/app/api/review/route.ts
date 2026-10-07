// app/api/review/route.js
import { NextResponse, NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { postReview } from '@/helpers/reviews/review';
import prisma from '@/helpers/prisma/prisma';
import { getServerSession } from 'next-auth';
import authOptions from '@/helpers/auth/options';
import { getDictionary } from '@/helpers/i18n/locale';
import { isValidId, validateReviewContent } from '@/helpers/reviews/validate';

function badRequest(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req : NextRequest) {
  const t = getDictionary();
  try {
    // the reviewer is always the signed-in user, never a userId sent by the client
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return badRequest(t.errSignIn, 401);
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    if (!user) {
      return badRequest(t.errSignIn, 401);
    }
    const userId = user.id;

    let body: any;
    try {
      body = await req.json();
    } catch {
      return badRequest(t.errBadBody);
    }
    const { professorId, courseId } = body ?? {};

    if (!isValidId(professorId) || !isValidId(courseId)) {
      return badRequest(t.errChoose);
    }

    const checked = validateReviewContent(body, t);
    if ('error' in checked) {
      return badRequest(checked.error);
    }

    // the professor must actually teach the course being reviewed
    const teaches = await prisma.courseProfessor.findUnique({
      where: { courseId_professorId: { courseId, professorId } }
    });
    if (!teaches) {
      return badRequest(t.errNotTaught);
    }

    const existingReview = await prisma.review.findFirst({
      where: { professorId, courseId, userId }
    });
    if (existingReview) {
      return badRequest(t.errDuplicate, 409);
    }

    const review = { professorId, courseId, userId, ...checked.content };

    const result = await postReview(review);
    if (!result) {
      return badRequest(t.reviewFailed, 500);
    }
    return NextResponse.json(result);

  } catch (error) {
    // two submits at once can both pass the check above; the unique constraint catches the second
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return badRequest(t.errDuplicate, 409);
    }
    console.error('Failed to submit review:', error);
    return badRequest(t.reviewFailed, 500);
  }
}
