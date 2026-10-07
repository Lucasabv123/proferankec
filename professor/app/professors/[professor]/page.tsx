import prisma from "@/helpers/prisma/prisma"; 
import  CourseCard  from "@/components/course/card";
import authOptions from "@/helpers/auth/options";
import { getServerSession } from "next-auth";
import Review from "@/components/reviews/review";
import ReviewCard from "@/components/reviews/reviewcard";
import Filter from "@/components/reviews/filterDrop";
import SiteHeader from "@/components/layout/siteHeader";
import { notFound } from "next/navigation";
import { parseIdParam, schoolPath } from "@/helpers/links";
import Link from "next/link";
import { getDictionary } from "@/helpers/i18n/locale";
import { isTranslationEnabled } from "@/helpers/translate/translate";




function calcAverageRatings(reviews, course){
  const overallRatings = reviews.map(review => review.overallRating);
  const difficulties = reviews.map(review => review.difficulty);
  const workloads = reviews.map(review => review.workload);
  const lectures = reviews.map(review => review.lecture);
  const learning = reviews.map(review => review.learning);

  // with no reviews, show zero stars instead of NaN
  const mean = (values: number[]) => values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const meanOverallRating = mean(overallRatings);
  const meanDifficulty = mean(difficulties);
  const meanWorkload = mean(workloads);
  const meanLecture = mean(lectures);
  const meanLearning = mean(learning);

  const overallReview = {
    overallRating: meanOverallRating,
    difficulty: meanDifficulty,
    workload: meanWorkload,
    lecture: meanLecture,
    learning: meanLearning,
    course: course,
  }

  return overallReview; 

}




async function getReviews(professor, courseId = null) {
  // Convert courseId to an integer if it's provided
  const reviews = await prisma.review.findMany({
      where: {
          professorId: professor.id,
          hidden: false,
          ...(courseId && { courseId: parseInt(courseId, 10) }), // Convert courseId to an integer
      },
      include: {
          course: true,
      },
  });

  const allReviews = await prisma.review.findMany({
    where: {
      professorId: professor.id,
      hidden: false
    },
    include: {
      course: true,
  },
 });

  
  let course; 
  if(courseId == null) {
    course = {
      id: null,
      name: getDictionary().allCourses
    }
  }else{
    // take the name from the professor's own course list so a course with no reviews still works
    course = professor.courses
      .map(({ course }) => course)
      .find((c) => c.id === parseInt(courseId, 10)) ?? { id: parseInt(courseId, 10), name: getDictionary().unknownCourse };
  }
  
  
    
  const overallReview = calcAverageRatings(reviews, course);
  
  

  return {reviews: reviews, overallReview: overallReview, allReviews: allReviews};
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
     
    const courseId = searchParams?.courseId || null; 
    const t = getDictionary();
    const reviewsComp = await getReviews(professor, courseId);
    const reviews = reviewsComp.reviews;
    const allReviews = reviewsComp.allReviews;  
    const overallReview = reviewsComp.overallReview;
    const allCourses = professor.courses
      .map(({ course }) => course)
      .filter((value, index, self) =>
        index === self.findIndex((t) => t.id === value.id)
      );
      
    const allCoursesWithReviews = allCourses.filter(course => allReviews.some(review => review.courseId === course.id));

    
    const userid = await getUserId(session); 
    const canTranslate = isTranslationEnabled();
     

  
    return (
      <>
      <SiteHeader session={session} />
      <main className="flex min-h-screen flex-col items-center gap-4 px-4 py-6 md:p-12 max-w-5xl mx-auto w-full">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold">{professor.Prefix} {professor.Firstname} {professor.Lastname}</h1>
          <Link className="underline" href={schoolPath(professor.school)}>{professor.school.name}</Link>
        </div>
        <h2 className="text-xl font-semibold">{t.courses}</h2>
        <ul className="grid w-full grid-cols-1 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
          {professor.courses.map(({ course }) => (
            <li key={course.id}>
              <CourseCard course={course} />
            </li>
          ))}
        </ul>
        <div className="w-full">
          <h1 className="pb-4 text-2xl md:text-3xl text-center">{t.overallRatings}</h1>
          <ReviewCard review={overallReview} />
        </div>

        <h1>{t.filterForCourse}</h1>
        <Filter items={allCoursesWithReviews} type="course" itemId={courseId} param="courseId" />

        <div className="py-3" />

        <Review proco = { professor } session = { session } userid={userid} />

        <div className="py-3" />
        
        <h2 className="text-xl font-semibold">{t.reviews}</h2>
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
      </main>
      </>
    );
  };
  
  export default ProfessorPage;
  
  