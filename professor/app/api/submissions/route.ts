import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/helpers/prisma/prisma';
import { getCurrentUser } from '@/helpers/auth/currentUser';
import { getDictionary } from '@/helpers/i18n/locale';
import { format } from '@/helpers/i18n/dictionaries';
import { coursePath } from '@/helpers/links';
import {
  MAX_PENDING_PER_USER,
  findPossibleDuplicates,
  takenCourseCode,
  validateSubmission,
} from '@/helpers/submissions/submissions';

function badRequest(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

// a signed-in student suggests a missing professor, course, or pairing for an admin to approve.
// Unless `confirmed` is true, a suggestion that looks like existing records comes back as 409
// with `duplicates`, so the student can pick one of those instead.
export async function POST(req: NextRequest) {
  const t = getDictionary();
  const user = await getCurrentUser();
  if (!user) return badRequest(t.errSignInToSuggest, 401);

  const body = await req.json().catch(() => null);
  if (!body) return badRequest(t.errBadBody);

  const checked = await validateSubmission(body, t);
  if ('error' in checked) return badRequest(checked.error);
  const submission = checked.submission;

  if (submission.courseId === null) {
    const taken = await takenCourseCode(submission.schoolId, submission.courseCode);
    if (taken) {
      return NextResponse.json(
        { error: t.errSuggestCodeTaken, duplicates: [{ label: `${taken.code} · ${taken.name}`, href: coursePath(taken) }] },
        { status: 409 },
      );
    }
  }

  if (body.confirmed !== true) {
    const duplicates = await findPossibleDuplicates(submission);
    if (duplicates.length > 0) {
      return NextResponse.json({ duplicates }, { status: 409 });
    }
  }

  const pending = await prisma.submission.count({ where: { userId: user.id, status: 'pending' } });
  if (pending >= MAX_PENDING_PER_USER) {
    return badRequest(format(t.errSuggestTooMany, { max: MAX_PENDING_PER_USER }), 429);
  }

  await prisma.submission.create({ data: { ...submission, userId: user.id } });
  return NextResponse.json({ ok: true }, { status: 201 });
}
