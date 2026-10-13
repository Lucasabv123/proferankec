import { notFound } from "next/navigation";
import prisma from "@/helpers/prisma/prisma";
import { getCurrentUser } from "@/helpers/auth/currentUser";
import { getDictionary } from "@/helpers/i18n/locale";
import { format } from "@/helpers/i18n/dictionaries";
import SiteHeader from "@/components/layout/siteHeader";
import { getServerSession } from "next-auth";
import authOptions from "@/helpers/auth/options";
import ReviewActions from "@/components/admin/reviewActions";
import SubmissionActions from "@/components/admin/submissionActions";
import Link from "next/link";
import { coursePath, professorName, professorPath } from "@/helpers/links";

// site stats, then students' suggested professors and courses, then reported or hidden reviews (most-reported first);
// only admins (User.isAdmin) can open it
export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    notFound();
  }
  const t = getDictionary();
  const session = await getServerSession(authOptions);

  // User has no signup date, so "active" counts users holding an unexpired login session:
  // NextAuth sessions last 30 days and are extended on each visit, so that is anyone signed in during the last 30 days
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [userCount, activeUsers, reviewCount, weekReviewCount] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { sessions: { some: { expires: { gt: now } } } } }),
    prisma.review.count(),
    prisma.review.count({ where: { createdAt: { gte: weekAgo } } }),
  ]);
  const stats = [
    { label: t.statsUsers, value: userCount },
    { label: t.statsActiveUsers, value: activeUsers },
    { label: t.statsReviews, value: reviewCount },
    { label: t.statsReviewsWeek, value: weekReviewCount },
  ];

  const reviews = await prisma.review.findMany({
    where: { OR: [{ reports: { some: {} } }, { hidden: true }] },
    include: {
      professor: true,
      course: true,
      reports: { orderBy: { createdAt: "desc" } },
    },
  });
  reviews.sort((a, b) => b.reports.length - a.reports.length);

  const submissions = await prisma.submission.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    include: { school: true, user: true, professor: true, course: true },
  });

  return (
    <>
    <SiteHeader session={session} />
    <main className="flex min-h-screen flex-col items-center px-4 py-6 md:p-12">
      <h1 className="text-3xl font-bold mb-6">{t.statsTitle}</h1>
      <dl className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse bg-white rounded-lg shadow p-4 text-center">
            <dt className="text-sm text-gray-500 mt-1">{s.label}</dt>
            <dd className="text-3xl font-bold">{s.value.toLocaleString(t.dateLocale)}</dd>
          </div>
        ))}
      </dl>

      <h2 className="text-3xl font-bold mb-8">{t.adminSuggestionsTitle}</h2>
      {submissions.length === 0 ? (
        <p className="mb-12">{t.adminSuggestionsEmpty}</p>
      ) : (
        <ul className="w-full max-w-4xl space-y-6 mb-12">
          {submissions.map((s) => (
            <li key={s.id} className="bg-white rounded-lg shadow p-4 md:p-6">
              <p className="text-sm text-gray-500 mb-2">
                {s.school.name} · {s.user.name ?? s.user.email} · {s.createdAt.toLocaleDateString(t.dateLocale)}
              </p>
              <dl className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 mb-3">
                <dt className="font-semibold">{t.suggestProfessorHeading}</dt>
                <dd style={{ overflowWrap: "anywhere" }}>
                  {s.professor ? (
                    <Link className="underline" href={professorPath(s.professor)}>{professorName(s.professor)}</Link>
                  ) : (
                    <span className="rounded bg-amber-100 px-2 text-xs font-semibold text-amber-800 mr-2">{t.newLabel}</span>
                  )}
                </dd>
                <dt className="font-semibold">{t.suggestCourseHeading}</dt>
                <dd style={{ overflowWrap: "anywhere" }}>
                  {s.course ? (
                    <Link className="underline" href={coursePath(s.course)}>{s.course.code ? `${s.course.code} · ${s.course.name}` : s.course.name}</Link>
                  ) : (
                    <span className="rounded bg-amber-100 px-2 text-xs font-semibold text-amber-800 mr-2">{t.newLabel}</span>
                  )}
                </dd>
              </dl>
              {s.note && <p className="text-gray-800 mb-3">&ldquo;{s.note}&rdquo;</p>}
              <SubmissionActions
                submissionId={s.id}
                newProfessor={!s.professor}
                newCourse={!s.course}
                initial={{
                  firstName: s.firstName ?? "",
                  lastName: s.lastName ?? "",
                  courseCode: s.courseCode ?? "",
                  courseName: s.courseName ?? "",
                  department: s.department ?? "",
                }}
              />
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-3xl font-bold mb-8">{t.adminTitle}</h2>

      {reviews.length === 0 ? (
        <p>{t.adminEmpty}</p>
      ) : (
        <ul className="w-full max-w-4xl space-y-6">
          {reviews.map((review) => (
            <li key={review.id} className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-2">
                <div>
                  <p className="font-semibold">
                    {review.professor.Prefix} {review.professor.Firstname} {review.professor.Lastname} · {review.course.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(t.reportsCount, { count: review.reports.length })}
                    {review.hidden ? ` · ${t.hiddenLabel}` : ""}
                  </p>
                </div>
                <ReviewActions reviewId={review.id} hidden={review.hidden} />
              </div>
              <p className="text-gray-800 mb-3">{review.comment}</p>
              <ul className="text-sm text-gray-600 list-disc pl-5">
                {review.reports.map((report) => (
                  <li key={report.id}>{report.reason || t.noReason}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </main>
    </>
  );
}
