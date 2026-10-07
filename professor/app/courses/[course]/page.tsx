import prisma from "@/helpers/prisma/prisma"; 
import  ProfessorCard  from "@/components/professor/card";
import Filter from "@/components/reviews/filterDrop";
import ReviewCard from "@/components/reviews/reviewcard";
import Review from "@/components/reviews/review";
import { getServerSession } from 'next-auth'; 
import authOptions from "@/helpers/auth/options";
import HomeButton from "@/components/util/homeButton";
import TopSearchSection from "@/components/searchbar/topSection";
import Login from "@/components/auth/loginformbasicgoogle01"; 
import { notFound } from "next/navigation";
import { parseIdParam, schoolPath } from "@/helpers/links";
import Link from "next/link";
import { getDictionary } from "@/helpers/i18n/locale";
import { isTranslationEnabled } from "@/helpers/translate/translate";



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




function calcAverageRatings(reviews : Review[], professor : Professor){

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
    professor: professor,
  }

  return overallReview; 

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


async function getReviews(course : Course, professorId = null){
  const reviews = await prisma.review.findMany({
    where: {
      courseId: course.id,
      hidden: false,
      ...(professorId && { professorId: parseInt(professorId, 10) }),
    },
    include: {
      professor: true,
    },
  });

  const allReviews = await prisma.review.findMany({
    where:{
      courseId: course.id,
      hidden: false,
    }, 
    include: {
      professor: true,
  },  
  });


  let professor;
  if(professorId == null){
    professor = {
      id: null,
      Prefix: "",
      Firstname: getDictionary().allProfessors,
      Lastname: ""
    }
  } else{
    // take the name from the course's own professor list so a professor with no reviews still works
    professor = course.professors
      .map(({ professor }) => professor)
      .find((p) => p.id === parseInt(professorId, 10)) ?? { id: parseInt(professorId, 10), Prefix: "", Firstname: getDictionary().unknownProfessor, Lastname: "" };
  }
  const overallReview = calcAverageRatings(reviews, professor);
  return({reviews: reviews, overallReview: overallReview, allReviews: allReviews});
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
  const reviewsComp = await getReviews(course, professorId);
  const reviews = reviewsComp.reviews;
  const allReviews = reviewsComp.allReviews;
  const overallReview = reviewsComp.overallReview;  
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
    <main className="detail-page">
      <div className = "detail-home">
        <HomeButton /> 
        {session ? null : <Login showLogin ={true} />}
      </div>

      <div className="detail-search"><TopSearchSection /> </div>

      <h1>{course.code ? `${course.code} ` : ""}{course.name} - <Link className="underline" href={schoolPath(course.school)}>{course.school.name}</Link> - {course.Department}</h1>
      <h2>{t.professors}</h2>
      <ul>
        {course.professors.map(({ professor }) => (
          <li key={professor.id}>
            <ProfessorCard professor={professor} />
          </li>
        ))}
      </ul>

      <div className = "py-8">
        <h1 className = "pt-5 pb-7 text-3xl text-center">{t.overallRatings}</h1>
        <ReviewCard review={overallReview} type="course" />
      </div>

      <h1>{t.filterForProfessor}</h1>
      <Filter items={allProffessorWithReviews} itemId={professorId} type="professor" param="professorId" />

      <div className="py-5 pb-8" />

      <Review proco={course} session={session} userid={userid} type="course" />

      <h1>{t.reviews}</h1>
      {reviews.length === 0 ? (
        <p>{t.noReviewsYet}</p>
      ) : (
        <ul>
          {reviews.map((review) => (
            <li key={review.id}>
              <ReviewCard review={review} type="course" canReport={!!session} isOwn={userid !== null && review.userId === userid} canTranslate={canTranslate} />
            </li>
          ))}
        </ul>
      )}


    </main>
  );
};

export default CoursePage;
