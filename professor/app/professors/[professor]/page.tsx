import prisma from "@/helpers/prisma/prisma"; 
import authOptions from "@/helpers/auth/options";
import { getServerSession } from "next-auth";
import Review from "@/components/reviews/review";
import ReviewCard from "@/components/reviews/reviewcard";
import Filter from "@/components/reviews/filterDrop";
import SiteHeader from "@/components/layout/siteHeader";
import { notFound } from "next/navigation";
import { coursePath, parseIdParam, professorName, schoolPath } from "@/helpers/links";
import Link from "next/link";
import { getDictionary } from "@/helpers/i18n/locale";
import { isTranslationEnabled } from "@/helpers/translate/translate";
import { format } from "@/helpers/i18n/dictionaries";
import { qualityColor, summarizeReviews } from "@/helpers/reviews/summary";
import { Distribution, ScoreHeadline, StatPair } from "@/components/reviews/ratingSummary";




// the visible reviews of this professor, newest first; the page filters them by course itself
async function getReviews(professor) {
  return prisma.review.findMany({
    where: { professorId: professor.id, hidden: false },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });
}

async function getUserId(session) {
   // grab the session from the db
    if (!session) {
      return null;
    }
    const user = await prisma.user.findFirst({
      where: {
        email: session.user.email
      }
    });
    return user?.id ?? null;

}

async function getProfessorData(professorParam) {
    const id = parseIdParam(professorParam);
    // old links were "Prefix-First-Last"; keep them working
    const [prefix, firstname, lastname] = decodeURIComponent(professorParam).split("-");

    const prof = await prisma.professor.findFirst({
      where: id !== null ? { id } : {
        Prefix: prefix,
        Firstname: firstname,
        Lastname: lastname
      },
      include: {
        school: true,
        courses: {
          include: {
            course: { include: { school: true } }
          }
        }
      }
    });
    
    return prof;
  }




const ProfessorPage = async ({ params, searchParams }) => {
    const professor = await getProfessorData(params.professor);
    if (!professor) {
      notFound();
    }
    const session = await getServerSession(authOptions);
    const t = getDictionary();

    const allReviews = await getReviews(professor);
    const allCourses = professor.courses
      .map(({ course }) => course)
      .filter((value, index, self) => index === self.findIndex((c) => c.id === value.id));
    const allCoursesWithReviews = allCourses.filter(course => allReviews.some(review => review.courseId === course.id));

    // ?courseId= narrows the score and the list to one course, like the course filter on Rate My Professors
    const courseId = searchParams?.courseId || null;
    const selectedCourseId = courseId ? parseInt(courseId, 10) : null;
    const selectedCourse = selectedCourseId === null ? null
      : allCourses.find((c) => c.id === selectedCourseId) ?? { id: selectedCourseId, code: null, name: t.unknownCourse };
    const reviews = selectedCourseId === null ? allReviews : allReviews.filter((r) => r.courseId === selectedCourseId);
    const summary = summarizeReviews(reviews);

    const courseLabel = (course) => course.code ? `${course.code} ${course.name}` : course.name;
    const courseRatings = allCourses
      .map((course) => ({ course, summary: summarizeReviews(allReviews.filter((r) => r.courseId === course.id)) }))
      .sort((a, b) => b.summary.count - a.summary.count);
    const departments = Array.from(new Set(allCourses.map((c) => c.Department).filter(Boolean)));

    const userid = await getUserId(session); 
    const canTranslate = isTranslationEnabled();

    return (
      <>
      <SiteHeader session={session} />
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-4 py-6 md:p-12">
        <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <ScoreHeadline summary={summary} scope={selectedCourse ? format(t.inCourse, { course: courseLabel(selectedCourse) }) : undefined} />
            <div>
              <h1 className="text-3xl md:text-4xl font-black" style={{ overflowWrap: "anywhere" }}>{professorName(professor)}</h1>
              <p className="mt-2">
                {t.professorAt} <Link className="font-semibold underline" href={schoolPath(professor.school)}>{professor.school.name}</Link>
              </p>
              {departments.length > 0 && <p className="mt-1 text-sm text-slate-600">{departments.join(" · ")}</p>}
            </div>
            <StatPair summary={summary} />
            <div>
              <Review
                proco={professor}
                session={session}
                userid={userid}
                buttonLabel={`${t.rate} →`}
                buttonClassName="min-h-11 rounded-full bg-blue-600 px-10 py-2 font-semibold text-white hover:bg-blue-700"
              />
              <p className="mt-3 text-sm">
                <Link className="text-blue-700 underline" href={`/suggest?professor=${professor.id}`}>{t.suggestMissingCourse}</Link>
              </p>
            </div>
          </div>
          <Distribution summary={summary} />
        </section>

        {summary.count > 0 && (
          <section>
            <h2 className="mb-3 text-xl font-semibold">{t.overallRatings}</h2>
            <ReviewCard review={{ ...summary, overallRating: summary.average, course: { name: selectedCourse ? courseLabel(selectedCourse) : t.allCourses } }} />
          </section>
        )}

        <section>
          <h2 className="mb-3 text-xl font-semibold">{t.ratingsByCourse}</h2>
          <ul className="flex flex-col divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {courseRatings.map(({ course, summary: s }) => (
              <li key={course.id} className="flex items-center gap-3 px-4 py-3">
                {s.count ? (
                  <Link
                    href={`?courseId=${course.id}#ratings`}
                    className="flex min-w-0 flex-1 items-center gap-3 hover:underline"
                  >
                    <span className={`flex h-10 w-12 shrink-0 items-center justify-center font-black tabular-nums ${qualityColor(s.average)}`}>{s.average.toFixed(1)}</span>
                    <span className="min-w-0">
                      <span className="block font-semibold" style={{ overflowWrap: "anywhere" }}>{courseLabel(course)}</span>
                      <span className="block text-sm text-slate-600">{s.count === 1 ? t.oneRating : format(t.manyRatings, { count: s.count })}</span>
                    </span>
                  </Link>
                ) : (
                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-10 w-12 shrink-0 items-center justify-center bg-slate-100 font-black text-slate-400">–</span>
                    <span className="min-w-0">
                      <span className="block font-semibold" style={{ overflowWrap: "anywhere" }}>{courseLabel(course)}</span>
                      <span className="block text-sm text-slate-600">{t.noRatingsShort}</span>
                    </span>
                  </span>
                )}
                <Link href={coursePath(course)} className="shrink-0 text-sm text-blue-700 hover:underline">{t.viewCourse}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section id="ratings" className="scroll-mt-4">
          <h2 className="mb-3 border-b border-slate-200 pb-3 text-xl font-semibold">
            {reviews.length === 1 ? t.studentRatingsOne : format(t.studentRatingsMany, { count: reviews.length })}
          </h2>
          <div className="mb-4">
            <Filter items={allCoursesWithReviews} type="course" itemId={selectedCourseId ?? ""} param="courseId" />
          </div>
          {reviews.length === 0 ? (
            <p>{t.noReviewsYet}</p>
          ) : (
            <ul className="flex flex-col w-full">
              {reviews.map(review => (
                <li key={review.id}>
                  <ReviewCard review={review} canReport={!!session} isOwn={userid !== null && review.userId === userid} canTranslate={canTranslate} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      </>
    );
  };
  
  export default ProfessorPage;
