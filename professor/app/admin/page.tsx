import { notFound } from "next/navigation";
import prisma from "@/helpers/prisma/prisma";
import { getCurrentUser } from "@/helpers/auth/currentUser";
import { getDictionary } from "@/helpers/i18n/locale";
import { format } from "@/helpers/i18n/dictionaries";
import HomeButton from "@/components/util/homeButton";
import ReviewActions from "@/components/admin/reviewActions";

// reported or hidden reviews, most-reported first; only admins (User.isAdmin) can open it
export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    notFound();
  }
  const t = getDictionary();

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
    <main className="relative flex min-h-screen flex-col items-center p-8 md:p-24">
      <div className="absolute top-4 left-4">
        <HomeButton />
      </div>
      <h1 className="text-3xl font-bold mb-8">{t.adminTitle}</h1>

      {reviews.length === 0 ? (
        <p>{t.adminEmpty}</p>
      ) : (
        <ul className="w-full max-w-4xl space-y-6">
          {reviews.map((review) => (
            <li key={review.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start gap-4 mb-2">
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
  );
}
