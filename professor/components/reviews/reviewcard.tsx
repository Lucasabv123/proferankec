"use client"; 
import Rating from "react-rating";
import { useDictionary } from "@/components/i18n/provider";
import ReportButton from "./reportButton";
import ReviewComment from "./reviewComment";
import OwnReviewActions from "./ownReviewActions";
import { professorName } from "@/helpers/links";

type Review = {
  id?: number,
  professorId?: number, 
  courseId?: number, 
  userId?: number, 
  overallRating: number, 
  difficulty: number, 
  workload: number,
  lecture: number,
  learning: number,
  comment?: string, 
  course?: {
    name: string
  },
  professor?: {
    Prefix?: string, 
    Firstname: string, 
    Lastname: string
  },
}

interface ReviewCardProps {
  review: Review; 
  type?: string;
  canReport?: boolean;
  isOwn?: boolean; // the signed-in user wrote this review, so they can edit or delete it
  canTranslate?: boolean; // the translation service is configured
}

interface StaticStarRatingProps {
  rating: number; 
}

const StaticStarRating: React.FC<StaticStarRatingProps> = ({ rating }) => {
  const RatingComponent = Rating as any;

  return (
    <RatingComponent
      initialRating={rating}
      emptySymbol="far fa-star"
      fullSymbol="fas fa-star"
      fractions={2}
      readonly={true}
    />
  )
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, type = "professor", canReport = false, isOwn = false, canTranslate = false }) => {
  const t = useDictionary();
  return (
    <div className="bg-gray-200 shadow-lg rounded-lg p-4 sm:p-6 mb-6 w-full max-w-4xl mx-auto">
      <h3 className="text-xl md:text-2xl font-bold mb-4 text-center">
        {type === "professor" ? review.course?.name : (review.professor ? professorName(review.professor) : "")}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div>
          <h1 className="text-lg font-semibold">{t.overallRating}</h1>
          <StaticStarRating rating={review.overallRating} />
        </div>
        <div>
          <h1 className="text-lg font-semibold">{t.difficulty}</h1>
          <StaticStarRating rating={review.difficulty} />
        </div>
        <div>
          <h1 className="text-lg font-semibold">{t.workload}</h1>
          <StaticStarRating rating={review.workload} />
        </div>
        <div>
          <h1 className="text-lg font-semibold">{t.lectureQuality}</h1>
          <StaticStarRating rating={review.lecture} />
        </div>
        <div>
          <h1 className="text-lg font-semibold">{t.learningValue}</h1>
          <StaticStarRating rating={review.learning} />
        </div>
      </div>

      <ReviewComment reviewId={review.id} comment={review.comment} canTranslate={canTranslate} />
      {review.id && isOwn ? (
        <div className="mt-3 flex flex-wrap justify-end items-center gap-3">
          <OwnReviewActions
            reviewId={review.id}
            initial={{
              overallRating: review.overallRating,
              difficulty: review.difficulty,
              workload: review.workload,
              lecture: review.lecture,
              learning: review.learning,
              comment: review.comment ?? "",
            }}
          />
        </div>
      ) : canReport && review.id ? (
        <div className="mt-3 text-right">
          <ReportButton reviewId={review.id} />
        </div>
      ) : null}
    </div>
  );
}

export default ReviewCard;
