// app/api/review/route.js
import { NextResponse, NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { postReview } from '@/helpers/reviews/review';
import prisma from '@/helpers/prisma/prisma';
import { getServerSession } from 'next-auth';
import authOptions from '@/helpers/auth/options';

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
  try {
    // the reviewer is always the signed-in user, never a userId sent by the client
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return badRequest('You must be signed in to leave a review', 401);
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    if (!user) {
      return badRequest('You must be signed in to leave a review', 401);
    }
    const userId = user.id;

    let body: any;
    try {
      body = await req.json();
    } catch {
      return badRequest('Invalid request body');
    }
    const { professorId, courseId, comment } = body ?? {};

    if (!isValidId(professorId) || !isValidId(courseId)) {
      return badRequest('Choose a professor and a course');
    }

    for (const field of SCORE_FIELDS) {
      if (!isValidScore(body[field])) {
        return badRequest('Give every category a rating from 0.5 to 5 stars');
      }
    }

    if (typeof comment !== 'string' || comment.trim() === '') {
      return badRequest('Comment cannot be empty');
    }
    if (comment.length > MAX_COMMENT_LENGTH) {
      return badRequest(`Comment must be ${MAX_COMMENT_LENGTH} characters or fewer`);
    }

    // the professor must actually teach the course being reviewed
    const teaches = await prisma.courseProfessor.findUnique({
      where: { courseId_professorId: { courseId, professorId } }
    });
    if (!teaches) {
      return badRequest('That professor does not teach that course');
    }

    const existingReview = await prisma.review.findFirst({
      where: { professorId, courseId, userId }
    });
    if (existingReview) {
      return badRequest('You already reviewed this professor for this course', 409);
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
      return badRequest('Failed to submit review', 500);
    }
    return NextResponse.json(result);

  } catch (error) {
    // two submits at once can both pass the check above; the unique constraint catches the second
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return badRequest('You already reviewed this professor for this course', 409);
    }
    console.error('Failed to submit review:', error);
    return badRequest('Failed to submit review', 500);
  }
}
