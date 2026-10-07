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
    wouldTakeAgain: boolean | null,
    comment: string
}

// errors are left to the caller so it can tell a duplicate review (P2002) from other failures
export const postReview = async ( review : Review ) => {
    return prisma.review.create({
        data: {
            professorId: review.professorId,
            courseId: review.courseId,
            userId: review.userId,
            overallRating: review.overallRating,
            difficulty: review.difficulty,
            workload: review.workload,
            lecture: review.lecture,
            learning: review.learning,
            wouldTakeAgain: review.wouldTakeAgain,
            comment: review.comment
        }
    });
}
