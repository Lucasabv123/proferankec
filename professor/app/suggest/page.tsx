import Link from "next/link";
import prisma from "@/helpers/prisma/prisma";
import { getServerSession } from "next-auth";
import authOptions from "@/helpers/auth/options";
import SiteHeader from "@/components/layout/siteHeader";
import Login from "@/components/auth/loginformbasicgoogle01";
import SuggestForm, { Picked } from "@/components/submissions/suggestForm";
import { getCurrentUser } from "@/helpers/auth/currentUser";
import { getDictionary } from "@/helpers/i18n/locale";
import { coursePath, parseIdParam, professorName, professorPath } from "@/helpers/links";

// /suggest[?school=usfq][&professor=12][&course=5]: students suggest a missing professor or course.
// The query fills in the school and the record the student came from.
export default async function SuggestPage({ searchParams }) {
  const t = getDictionary();
  const session = await getServerSession(authOptions);
  const user = await getCurrentUser();
  const schools = await prisma.school.findMany({ orderBy: { name: "asc" }, select: { id: true, key: true, name: true } });

  const professorId = searchParams?.professor ? parseIdParam(String(searchParams.professor)) : null;
  const courseId = searchParams?.course ? parseIdParam(String(searchParams.course)) : null;
  const professor = professorId ? await prisma.professor.findUnique({ where: { id: professorId } }) : null;
  const course = courseId ? await prisma.course.findUnique({ where: { id: courseId } }) : null;
  const schoolKey = String(searchParams?.school ?? "").toLowerCase();
  const schoolId =
    professor?.schoolId ?? course?.schoolId ?? schools.find((s) => s.key === schoolKey)?.id ?? (schools.length === 1 ? schools[0].id : null);

  const initialProfessor: Picked | null = professor && professor.schoolId === schoolId
    ? { id: professor.id, label: professor.displayName || professorName(professor) } : null;
  const initialCourse: Picked | null = course && course.schoolId === schoolId
    ? { id: course.id, label: course.code ? `${course.code} · ${course.name}` : course.name } : null;

  const mine = user
    ? await prisma.submission.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { professor: true, course: true },
      })
    : [];
  const statusLabel = { pending: t.suggestStatusPending, approved: t.suggestStatusApproved, rejected: t.suggestStatusRejected };
  const statusColor = { pending: "bg-amber-100 text-amber-800", approved: "bg-green-100 text-green-800", rejected: "bg-slate-200 text-slate-700" };

  return (
    <>
    <SiteHeader session={session} />
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 px-4 py-6 md:p-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{t.suggestTitle}</h1>
        <p className="text-slate-600">{t.suggestIntro}</p>
      </div>

      {user ? (
        <SuggestForm schools={schools} initialSchoolId={schoolId} initialProfessor={initialProfessor} initialCourse={initialCourse} />
      ) : (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <p>{t.signInToSuggest}</p>
          <Login showLogin={true} />
        </div>
      )}

      {mine.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold">{t.yourSuggestions}</h2>
          <ul className="flex flex-col divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {mine.map((s) => {
              const professorLabel = s.professor ? professorName(s.professor) : `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim();
              const courseLabel = s.course ? s.course.name : s.courseName ?? "";
              return (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <span className="min-w-0" style={{ overflowWrap: "anywhere" }}>
                    {s.status === "approved" && s.professor ? (
                      <Link className="font-semibold underline" href={professorPath(s.professor)}>{professorLabel}</Link>
                    ) : (
                      <span className="font-semibold">{professorLabel}</span>
                    )}
                    {" · "}
                    {s.status === "approved" && s.course ? (
                      <Link className="underline" href={coursePath(s.course)}>{courseLabel}</Link>
                    ) : courseLabel}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[s.status] ?? statusColor.pending}`}>
                    {statusLabel[s.status] ?? s.status}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
    </>
  );
}
