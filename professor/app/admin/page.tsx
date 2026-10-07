import { notFound } from "next/navigation";
import prisma from "@/helpers/prisma/prisma";
import { getCurrentUser } from "@/helpers/auth/currentUser";
import { getDictionary } from "@/helpers/i18n/locale";
import { format } from "@/helpers/i18n/dictionaries";
import SiteHeader from "@/components/layout/siteHeader";
import { getServerSession } from "next-auth";
import authOptions from "@/helpers/auth/options";
import ReviewActions from "@/components/admin/reviewActions";

// reported or hidden reviews, most-reported first; only admins (User.isAdmin) can open it
export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    notFound();
  }
  const t = getDictionary();
  const session = await getServerSession(authOptions);

  const reviews = await prisma.review.findMany({
    where: { OR: [{ reports: { some: {} } }, { hidden: true }] },
    include: {
      professor: true,
      course: true,
      reports: { orderBy: { createdAt: "desc" } },
    },
  });
  reviews.sort((a, b) => b.reports.length - a.reports.length);

  return (
    <>
    <SiteHeader session={session} />
    <main className="flex min-h-screen flex-col items-center px-4 py-6 md:p-12">
      <h1 className="text-3xl font-bold mb-8">{t.adminTitle}</h1>

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
