import prisma from "@/helpers/prisma/prisma"; 
import  ProfessorCard  from "@/components/professor/card";
import Filter from "@/components/reviews/filterDrop";
import ReviewCard from "@/components/reviews/reviewcard";
import Review from "@/components/reviews/review";
import { getServerSession } from 'next-auth'; 
import authOptions from "@/helpers/auth/options";
import SiteHeader from "@/components/layout/siteHeader";
import { notFound } from "next/navigation";
import { parseIdParam, professorName, schoolPath } from "@/helpers/links";
import Link from "next/link";
import { getDictionary } from "@/helpers/i18n/locale";
import { isTranslationEnabled } from "@/helpers/translate/translate";
import { format } from "@/helpers/i18n/dictionaries";
import { summarizeReviews } from "@/helpers/reviews/summary";
import { Distribution, ScoreHeadline, StatPair } from "@/components/reviews/ratingSummary";



type Course = {
  id: number;
  code?: string | null;
  name: string;
  Department: string;
  school: { key: string; name: string };
  professors: {
    professor: Professor;
  }[];
}

type Professor = {
  id: number;
  Prefix?: string;
  Firstname: string;
  Lastname: string;
};


type Review = {
  id: number;
  overallRating: number;
  difficulty: number;
  workload: number;
  lecture: number;
  learning: number;
  comment?: string;
  professorId?: number;
  courseId?: number;
  userId?: number;
  professor?: {
    id: number;
    Prefix?: string;
    Firstname: string;
    Lastname: string;
  };
  user?: {
    id: number;
    name: string;
  };
};




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


// the visible reviews of this course, newest first; the page filters them by professor itself
async function getReviews(course : Course){
  return prisma.review.findMany({
    where: { courseId: course.id, hidden: false },
    include: { professor: true },
    orderBy: { createdAt: "desc" },
  });
}


async function getCourseData(courseParam) {
  const id = parseIdParam(courseParam);
  // old links were "Name-School-Department"; keep them working
  const [name, school, department] = decodeURIComponent(courseParam).split("-");

  const courseData = await prisma.course.findFirst({
    where: id !== null ? { id } : {
      name: name,
      Department: department,
      school: { name: school },
    },
    include: {
      school: true,
      professors: {
        include: {
          professor: true,
        },
      },
    },
  });

  return courseData;
}


const CoursePage = async ({ params, searchParams }) => {

  const course = await getCourseData(params.course); 
  if (!course) {
    notFound();
  }
  const session = await getServerSession( authOptions );
  const professorId = searchParams.professorId;
  const t = getDictionary();
  const allReviews = await getReviews(course);
  const selectedProfessorId = professorId ? parseInt(professorId, 10) : null;
  const reviews = selectedProfessorId === null ? allReviews : allReviews.filter((r) => r.professorId === selectedProfessorId);
  const summary = summarizeReviews(reviews);
  const selectedProfessor = selectedProfessorId === null ? null
    : course.professors.map(({ professor }) => professor).find((p) => p.id === selectedProfessorId) ?? null;
  const selectedName = selectedProfessor ? professorName(selectedProfessor) : selectedProfessorId !== null ? t.unknownProfessor : null;
  const allProfessors = course.professors
    .map(({ professor }) => professor)
    .filter((value, index, self) =>
        index === self.findIndex((t) => (
            t.id === value.id
        ))
    );

  const allProffessorWithReviews = allProfessors.filter(professor => allReviews.some(review => review.professorId === professor.id));

  const userid = await getUserId(session); 
  const canTranslate = isTranslationEnabled();

  return (
    <>
    <SiteHeader session={session} />
    <main className="flex min-h-screen flex-col items-center gap-4 px-4 py-6 md:p-12 max-w-5xl mx-auto w-full">
      <section className="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <ScoreHeadline summary={summary} scope={selectedName ? format(t.forProfessor, { professor: selectedName }) : undefined} />
          <div>
            <h1 className="text-3xl md:text-4xl font-black" style={{ overflowWrap: "anywhere" }}>{course.code ? `${course.code} ` : ""}{course.name}</h1>
            <p className="mt-2"><Link className="font-semibold underline" href={schoolPath(course.school)}>{course.school.name}</Link> · {course.Department}</p>
          </div>
          <StatPair summary={summary} />
          <div>
            <Review
              proco={course}
              session={session}
              userid={userid}
              type="course"
              buttonLabel={`${t.rate} →`}
              buttonClassName="min-h-11 rounded-full bg-blue-600 px-10 py-2 font-semibold text-white hover:bg-blue-700"
            />
            <p className="mt-3 text-sm">
              <Link className="text-blue-700 underline" href={`/suggest?course=${course.id}`}>{t.suggestMissingProfessor}</Link>
            </p>
          </div>
        </div>
        <Distribution summary={summary} />
      </section>
      <h2 className="mt-6 text-xl font-semibold">{t.professors}</h2>
      <ul className="grid w-full grid-cols-1 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
        {course.professors.map(({ professor }) => (
          <li key={professor.id}>
            <ProfessorCard professor={professor} />
          </li>
        ))}
      </ul>

      {summary.count > 0 && (
        <div className="w-full">
          <h2 className="mb-3 text-xl font-semibold">{t.overallRatings}</h2>
          <ReviewCard
            review={{ ...summary, overallRating: summary.average, professor: { Firstname: selectedName ?? t.allProfessors, Lastname: "" } }}
            type="course"
          />
        </div>
      )}

      <section id="ratings" className="w-full scroll-mt-4">
        <h2 className="mb-3 border-b border-slate-200 pb-3 text-xl font-semibold">
          {reviews.length === 1 ? t.studentRatingsOne : format(t.studentRatingsMany, { count: reviews.length })}
        </h2>
        <div className="mb-4">
          <Filter items={allProffessorWithReviews} itemId={selectedProfessorId ?? ""} type="professor" param="professorId" />
        </div>
        {reviews.length === 0 ? (
          <p>{t.noReviewsYet}</p>
        ) : (
          <ul className="flex flex-col w-full">
            {reviews.map((review) => (
              <li key={review.id}>
                <ReviewCard review={review} type="course" canReport={!!session} isOwn={userid !== null && review.userId === userid} canTranslate={canTranslate} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
    </>
  );
};

export default CoursePage;
