// app/api/review/route.js
import { NextResponse, NextRequest } from 'next/server';
import { postReview } from '@/helpers/reviews/review';
import prisma from '@/helpers/prisma/prisma';

export async function POST(req : NextRequest) {
  try {
    const body = await req.json();
    const { professorId, courseId, userId, overallRating, difficulty, workload, lecture, learning, comment } = body;
    const review = {
      professorId,
      courseId,
      userId,
      overallRating,
      difficulty,
      workload,
      lecture,
      learning,
      comment
    };

    // Validate the received data 

    // check if review for course for professor already given by user
    const existingReview = await prisma.review.findFirst({
      where: {
        professorId,
        courseId,
        userId
      }
    });
    
    if (existingReview) {
      console.error('Review already exists for this course and professor');
      return NextResponse.error();
    }

    // check if any scores exceed the maximum value 
    if (overallRating > 5 || difficulty > 5 || workload > 5 || lecture > 5 || learning > 5) {
      console.error('Review scores cannot exceed 5');
      return NextResponse.error();
    }

    // check if any scores are negative
    if (overallRating < 0 || difficulty < 0 || workload < 0 || lecture < 0 || learning < 0) {
      console.error('Review scores cannot be negative');
      return NextResponse.error();
    }

    // check if comment is empty
    if (comment === '') {
      console.error('Comment cannot be empty');
      return NextResponse.error();
    }

    // check if comment is too long
    if (comment.length > 500) {
      console.error('Comment is too long');
      return NextResponse.error();
    }

    
    console.log(review); 
    const result = await postReview(review);
    if (result) {
      // Log the created review for debugging
      console.log('Created review:', result);
      return NextResponse.json(result);
    } else {
      console.error('Failed to submit review');
      return NextResponse.error();
    }

  } catch (error) {
    console.error('Failed to submit review:', error);
    return NextResponse.error();
  }
}
