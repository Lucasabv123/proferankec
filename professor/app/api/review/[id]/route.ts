import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/helpers/prisma/prisma';
import { getCurrentUser } from '@/helpers/auth/currentUser';
import { getDictionary } from '@/helpers/i18n/locale';
import { validateReviewContent } from '@/helpers/reviews/validate';

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// the signed-in user's own review with this id, or an error response
async function findOwnReview(idParam: string) {
  const t = getDictionary();
  const user = await getCurrentUser();
  if (!user) {
    return { response: error(t.errSignInToEdit, 401) };
  }
  const id = Number(idParam);
  const review = Number.isInteger(id) ? await prisma.review.findUnique({ where: { id } }) : null;
  if (!review) {
    return { response: error(t.errReviewNotFound, 404) };
  }
  if (review.userId !== user.id) {
    return { response: error(t.errNotYourReview, 403) };
  }
  return { review };
}

// edits the scores and comment; the professor and course stay the same
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const t = getDictionary();
  const found = await findOwnReview(params.id);
  if ('response' in found) return found.response;

  const body = await req.json().catch(() => null);
  const checked = validateReviewContent(body, t);
  if ('error' in checked) {
    return error(checked.error, 400);
  }

  const review = await prisma.review.update({ where: { id: found.review.id }, data: checked.content });
  return NextResponse.json(review);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const found = await findOwnReview(params.id);
  if ('response' in found) return found.response;

  // reports on the review are deleted with it (onDelete: Cascade)
  await prisma.review.delete({ where: { id: found.review.id } });
  return NextResponse.json({ ok: true });
}
