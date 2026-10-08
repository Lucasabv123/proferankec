import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/helpers/prisma/prisma';
import { getCurrentUser } from '@/helpers/auth/currentUser';
import { getDictionary } from '@/helpers/i18n/locale';
import { isValidId } from '@/helpers/reviews/validate';
import { approveSubmission } from '@/helpers/submissions/submissions';

// admin decision on a student's suggestion: approve (optionally with corrected names) or reject
export async function POST(req: NextRequest) {
  const t = getDictionary();
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const submissionId = body?.submissionId;
  const action = body?.action;
  if (!isValidId(submissionId) || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: t.errBadBody }, { status: 400 });
  }

  if (action === 'reject') {
    const { count } = await prisma.submission.updateMany({
      where: { id: submissionId, status: 'pending' },
      data: { status: 'rejected', reviewedAt: new Date() },
    });
    if (count === 0) return NextResponse.json({ error: t.errSuggestNotPending }, { status: 409 });
    return NextResponse.json({ ok: true });
  }

  try {
    await approveSubmission(submissionId, typeof body.edits === 'object' ? body.edits : null, t);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : t.actionFailed }, { status: 409 });
  }
}
