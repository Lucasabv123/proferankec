// app/api/review/route.js
import { NextResponse, NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { postReview } from '@/helpers/reviews/review';
import prisma from '@/helpers/prisma/prisma';
import { getServerSession } from 'next-auth';
import authOptions from '@/helpers/auth/options';
import { getDictionary } from '@/helpers/i18n/locale';
import { format } from '@/helpers/i18n/dictionaries';

const SCORE_FIELDS = ['overallRating', 'difficulty', 'workload', 'lecture', 'learning'] as const;
const MAX_COMMENT_LENGTH = 500;

function badRequest(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

// scores come from half-star inputs, so they must be 0.5 to 5 in steps of 0.5
function isValidScore(value: unknown): value is number {
  return typeof value === 'number' && value >= 0.5 && value <= 5 && Number.isInteger(value * 2);
}

function isValidId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
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
    const { professorId, courseId, comment } = body ?? {};

    if (!isValidId(professorId) || !isValidId(courseId)) {
      return badRequest(t.errChoose);
    }

    for (const field of SCORE_FIELDS) {
      if (!isValidScore(body[field])) {
        return badRequest(t.errScores);
      }
    }

    if (typeof comment !== 'string' || comment.trim() === '') {
      return badRequest(t.errEmptyComment);
    }
    if (comment.length > MAX_COMMENT_LENGTH) {
      return badRequest(format(t.errLongComment, { max: MAX_COMMENT_LENGTH }));
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

    const review = {
      professorId,
      courseId,
      userId,
      overallRating: body.overallRating,
      difficulty: body.difficulty,
      workload: body.workload,
      lecture: body.lecture,
      learning: body.learning,
      comment: comment.trim()
    };

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
