"use client"; 
import Rating from "react-rating";
import Link from "next/link";
import { coursePath, professorName, professorPath } from "@/helpers/links";
import { useDictionary } from "@/components/i18n/provider";
import ReportButton from "./reportButton";
import ReviewComment from "./reviewComment";
import OwnReviewActions from "./ownReviewActions";

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
  wouldTakeAgain?: boolean | null,
  comment?: string, 
  createdAt?: Date | string,
  course?: {
    id?: number,
    code?: string | null,
    name: string
  },
  professor?: {
    id?: number,
    Prefix?: string | null, 
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

export const StaticStarRating: React.FC<StaticStarRatingProps> = ({ rating }) => {
  const RatingComponent = Rating as any;

  return (
    <span className="static-rating"><span className="sr-only">{rating.toFixed(1)} / 5</span><span aria-hidden="true"><RatingComponent
      initialRating={rating}
      emptySymbol="far fa-star"
      fullSymbol="fas fa-star"
      fractions={2}
      readonly={true}
    /></span><span className="rating-value" aria-hidden="true">{rating.toFixed(1)}</span></span>
  )
}

// one student's review (or the averages, when it has no id): its course or professor, date, star ratings and comment
const ReviewCard: React.FC<ReviewCardProps> = ({ review, type = "professor", canReport = false, isOwn = false, canTranslate = false }) => {
  const t = useDictionary();

  // on a professor page each review names its course; on a course page, its professor
  let title: React.ReactNode = null;
  if (type === "professor" && review.course) {
    const name = review.course.code ? `${review.course.code} ${review.course.name}` : review.course.name;
    title = review.course.id && review.id ? <Link href={coursePath({ ...review.course, id: review.course.id })} className="hover:underline">{name}</Link> : name;
  } else if (type !== "professor" && review.professor) {
    const name = professorName(review.professor);
    title = review.professor.id && review.id ? <Link href={professorPath({ ...review.professor, id: review.professor.id })} className="hover:underline">{name}</Link> : name;
  }

  const date = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString(t.dateLocale, { year: "numeric", month: "short", day: "numeric" })
    : null;

  const stars: [string, number][] = [
    [t.overallRating, review.overallRating],
    [t.difficulty, review.difficulty],
    [t.workload, review.workload],
    [t.lectureQuality, review.lecture],
    [t.learningValue, review.learning],
  ];

  return (
    <article className="review-card p-5 sm:p-6 mb-6 w-full max-w-4xl mx-auto">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-xl md:text-2xl font-bold" style={{ overflowWrap: "anywhere" }}>{title}</h3>
        {date && <time className="text-sm font-semibold text-slate-600" dateTime={new Date(review.createdAt!).toISOString()}>{date}</time>}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3 mb-4">
        {stars.map(([label, rating]) => (
          <div key={label}>
            <h4 className="text-sm font-medium text-slate-600 mb-2">{label}</h4>
            <StaticStarRating rating={rating} />
          </div>
        ))}
        {typeof review.wouldTakeAgain === "boolean" && (
          <div>
            <h4 className="text-sm font-medium text-slate-600 mb-2">{t.wouldTakeAgain}</h4>
            <span className="text-sm font-semibold">{review.wouldTakeAgain ? t.yes : t.no}</span>
          </div>
        )}
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
              wouldTakeAgain: review.wouldTakeAgain ?? null,
              comment: review.comment ?? "",
            }}
          />
        </div>
      ) : canReport && review.id ? (
        <div className="mt-3 text-right">
          <ReportButton reviewId={review.id} />
        </div>
      ) : null}
    </article>
  );
}

export default ReviewCard;
