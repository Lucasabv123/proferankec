import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/helpers/prisma/prisma';
import { getDictionary, getLocale } from '@/helpers/i18n/locale';
import { isTranslationEnabled, otherLanguage, translateText } from '@/helpers/translate/translate';

// translates a review's comment into the visitor's language; only stored reviews can be
// translated, so the endpoint can't be used as a free general-purpose translator
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const t = getDictionary();
  if (!isTranslationEnabled()) {
    return NextResponse.json({ error: t.translateFailed }, { status: 503 });
  }

  const id = Number(params.id);
  const review = Number.isInteger(id)
    ? await prisma.review.findUnique({ where: { id }, select: { id: true, comment: true, hidden: true } })
    : null;
  if (!review || review.hidden) {
    return NextResponse.json({ error: t.errReviewNotFound }, { status: 404 });
  }

  const language = getLocale();
  const key = { reviewId_language: { reviewId: review.id, language } };
  const cached = await prisma.reviewTranslation.findUnique({ where: key });
  if (cached && cached.source === review.comment) {
    return NextResponse.json({ translation: cached.translation });
  }

  try {
    const translation = await translateText(review.comment, otherLanguage(language), language);
    const data = { source: review.comment, translation };
    await prisma.reviewTranslation.upsert({ where: key, update: data, create: { reviewId: review.id, language, ...data } });
    return NextResponse.json({ translation });
  } catch (error) {
    console.error('Failed to translate review:', error);
    return NextResponse.json({ error: t.translateFailed }, { status: 502 });
  }
}
