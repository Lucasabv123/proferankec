import prisma from "@/helpers/prisma/prisma";

type Review = {
    professorId: number, 
    courseId: number, 
    userId: number, 
    overallRating: number, 
    difficulty: number, 
    workload: number,
    lecture: number,
    learning: number,
    comment: string
}

export const postReview = async ( review : Review ) => {
    if(review){
        try{
            const newReview = await prisma.review.create({
                data: {
                    professorId: review.professorId,
                    courseId: review.courseId,
                    userId: review.userId,
                    overallRating: review.overallRating,
                    difficulty: review.difficulty,
                    workload: review.workload,
                    lecture: review.lecture,
                    learning: review.learning,
                    comment: review.comment
                }
            });
            return newReview;
        }catch(e){
            console.error('Failed to submit review:', e);
            return null;
        }
    } else {
        return null;
    }


}