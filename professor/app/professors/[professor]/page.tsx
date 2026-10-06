import prisma from "@/helpers/prisma/prisma"; 
import  CourseCard  from "@/components/course/card";
import authOptions from "@/helpers/auth/options";
import { getServerSession } from "next-auth";
import Review from "@/components/reviews/review";
import ReviewCard from "@/components/reviews/reviewcard";
import Filter from "@/components/reviews/filterDrop";
import HomeButton from '@/components/util/homeButton'; 
import TopSearchSection from "@/components/searchbar/topSection";
import Login from "@/components/auth/loginformbasicgoogle01"; 




function calcAverageRatings(reviews, course){
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
    course: course,
  }

  return overallReview; 

}




async function getReviews(professor, courseId = null) {
  // Convert courseId to an integer if it's provided
  const reviews = await prisma.review.findMany({
      where: {
          professorId: professor.id,
          ...(courseId && { courseId: parseInt(courseId, 10) }), // Convert courseId to an integer
      },
      include: {
          course: true,
          user: true,
      },
  });

  const allReviews = await prisma.review.findMany({
    where: {
      professorId: professor.id
    },
    include: {
      course: true,
      user: true
  },
 });

  
  let course; 
  if(courseId == null) {
    course = {
      id: null,
      name: "All Courses"
    }
  }else{
    course = reviews[0].course;
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
    return user.id;

}

async function getProfessorData(professorParam) {
    const decodedParam = decodeURIComponent(professorParam);
    const [prefix, firstname, lastname] = decodedParam.split("-");
  
    const prof = await prisma.professor.findFirst({
      where: {
        Prefix: prefix,
        Firstname: firstname,
        Lastname: lastname
      },
      include: {
        courses: {
          include: {
            course: true
          }
        }
      }
    });
    
    return prof;
  }




const ProfessorPage = async ({ params, searchParams }) => {
    console.log(params); 
    const professor = await getProfessorData(params.professor);
    const session = await getServerSession(authOptions);
     
    const courseId = searchParams?.courseId || null; 
    console.log('course id: ' + courseId);
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
    console.log(allCoursesWithReviews);

    
    const userid = await getUserId(session); 
     

  
    if (!professor) {
      return (
        <p>Professor not found</p>
      );
    }
  
    return (
      <main className=" relative flex min-h-screen flex-col items-center justify-between p-24">
        <div className="absolute top-4 left-4">
          <HomeButton />
          {session ? null : <Login showLogin={true} />}
        </div>

        <div className="absolute top-4 right-4 flex flex-col justify-evenl"><TopSearchSection /> </div>
          

        <h1>{professor.Prefix} {professor.Firstname} {professor.Lastname}</h1>
        <h2>Courses</h2>
        <ul  className="flex flex-row">
          {professor.courses.map(({ course }) => (
            <li className="px-3" key={course.id}>
              <CourseCard course={course} />
            </li>
          ))}
        </ul>
        <div className="py-8">
          <h1 className = "pt-5 pb-7 text-3xl text-center">Overall Ratings</h1>
          <ReviewCard review={overallReview} />
        </div>

        <h1>Filter for a Course</h1>
        <Filter items={allCoursesWithReviews} type="course" itemId={courseId} param="courseId" />

        <div className="py-5" />



        
        <Review proco = { professor } session = { session } userid={userid} />

        <div className="py-5" />
        
        <h2>Reviews</h2>
        {reviews.length === 0 ? (
          <p>No reviews yet</p>
        ) : (
          <ul className = "flex flex-col w-2/3  justify-center">
            {reviews.map(review => (
              <li key={review.id} className="p-5">
                <ReviewCard review={review} />
              </li>
            ))}
          </ul>
        )}
        
          
        
        
      </main>
    );
  };
  
  export default ProfessorPage;
  
  