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



type Course = {
  id: number;
  name: string;
  School: string;
  Department: string;
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

  console.log(professor); 
  const overallRatings = reviews.map(review => review.overallRating);
  const difficulties = reviews.map(review => review.difficulty);
  const workloads = reviews.map(review => review.workload);
  const lectures = reviews.map(review => review.lecture);
  const learning = reviews.map(review => review.learning);

  const meanOverallRating = overallRatings.reduce((a, b) => a + b, 0) / overallRatings.length;
  const meanDifficulty = difficulties.reduce((a, b) => a + b, 0) / difficulties.length;
  const meanWorkload = workloads.reduce((a, b) => a + b, 0) / workloads.length;
  const meanLecture = lectures.reduce((a, b) => a + b, 0) / lectures.length;
  const meanLearning = learning.reduce((a, b) => a + b, 0) / learning.length;

  const overallReview = {
    overallRating: meanOverallRating,
    difficulty: meanDifficulty,
    workload: meanWorkload,
    lecture: meanLecture,
    learning: meanLearning,
    professor: professor,
  }
  console.log('overallReview: ', overallReview);

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
   return user.id;

}


async function getReviews(course : Course, professorId = null){
  const reviews = await prisma.review.findMany({
    where: {
      courseId: course.id,
      ...(professorId && { professorId: parseInt(professorId, 10) }),
    },
    include: {
      professor: true,
      user: true,
    },
  });

  const allReviews = await prisma.review.findMany({
    where:{
      courseId: course.id,
    }, 
    include: {
      professor: true,
      user: true
  },  
  });


  let professor;
  if(professorId == null){
    professor = {
      id: null,
      Prefix: "All",
      Firstname: "Professors",
      Lastname: ""
    }
  } else{
    professor = reviews[0].professor; 
  }
  const overallReview = calcAverageRatings(reviews, professor);
  return({reviews: reviews, overallReview: overallReview, allReviews: allReviews});
}


async function getCourseData(courseParam) {
  const decodedParam = decodeURIComponent(courseParam);
  const [name, school, department] = decodedParam.split("-");
  console.log(name, school, department);

  const courseData = await prisma.course.findFirst({
    where: {
      name: name,
      Department: department,
      School: school,
    },
    include: {
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
  const session = await getServerSession( authOptions );
  const professorId = searchParams.professorId;
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
    console.log(allProfessors); 

  const allProffessorWithReviews = allProfessors.filter(professor => allReviews.some(review => review.professorId === professor.id));

  const userid = await getUserId(session); 


  if (!course) {
    return <p>Course not found</p>;
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between p-24">
      <div className = "absolute top-4 left-4">
        <HomeButton /> 
        {session ? null : <Login showLogin ={true} />}
      </div>

      <div className="absolute top-4 right-4 flex flex-col justify-evenly"><TopSearchSection /> </div>

      <h1>{course.name} - {course.School} - {course.Department}</h1>
      <h2>Professors</h2>
      <ul>
        {course.professors.map(({ professor }) => (
          <li key={professor.id}>
            <ProfessorCard professor={professor} />
          </li>
        ))}
      </ul>

      <div className = "py-8">
        <h1 className = "pt-5 pb-7 text-3xl text-center">Overall Ratings</h1>
        <ReviewCard review={overallReview} type="course" />
      </div>

      <h1>Filter for a Professor</h1>
      <Filter items={allProffessorWithReviews} itemId={professorId} type="professor" param="professorId" />

      <div className="py-5 pb-8" />

      <Review proco={course} session={session} userid={userid} type="course" />

      <h1>Reviews</h1>
      {reviews.length === 0 ? (
        <p>No reviews found</p>
      ) : (
        <ul>
          {reviews.map((review) => (
            <li key={review.id}>
              <ReviewCard review={review} type="course" />
            </li>
          ))}
        </ul>
      )}


    </main>
  );
};

export default CoursePage;
