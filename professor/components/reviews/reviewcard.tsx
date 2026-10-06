"use client"; 
import Rating from "react-rating";
import { useDictionary } from "@/components/i18n/provider";
import ReportButton from "./reportButton";

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

const ReviewCard: React.FC<ReviewCardProps> = ({ review, type = "professor", canReport = false }) => {
  const t = useDictionary();
  return (
    <div className="bg-gray-200 shadow-lg rounded-lg p-6 mb-6 w-full max-w-4xl mx-auto">
      <h3 className="text-xl md:text-2xl font-bold mb-4 text-center">
        {type === "professor" ? review.course?.name : `${review.professor?.Prefix} ${review.professor?.Firstname} ${review.professor?.Lastname}`}
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

      <p className="text-gray-700 text-sm md:text-base">{review.comment}</p>
      {canReport && review.id ? (
        <div className="mt-3 text-right">
          <ReportButton reviewId={review.id} />
        </div>
      ) : null}
    </div>
  );
}

export default ReviewCard;
