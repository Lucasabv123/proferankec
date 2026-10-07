type ScoredReview = { overallRating: number; difficulty: number; workload: number; lecture: number; learning: number; wouldTakeAgain?: boolean | null };

export type RatingSummary = {
    count: number;
    average: number; // mean overall rating, 0 with no reviews
    difficulty: number; // mean difficulty, 0 with no reviews
    workload: number;
    lecture: number;
    learning: number;
    wouldTakeAgainPercent: number | null; // null when nobody answered the question
    distribution: { stars: number; count: number }[]; // 5 stars down to 1
};

const mean = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);

// the headline numbers for a professor or course page, Rate My Professors style
export function summarizeReviews(reviews: ScoredReview[]): RatingSummary {
    const answered = reviews.filter((r) => typeof r.wouldTakeAgain === "boolean");
    const buckets = [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0 }));
    for (const review of reviews) {
        // half-star scores round to the nearest whole star (4.5 counts as 5, 0.5 as 1)
        const stars = Math.min(5, Math.max(1, Math.round(review.overallRating)));
        buckets[5 - stars].count++;
    }
    return {
        count: reviews.length,
        average: mean(reviews.map((r) => r.overallRating)),
        difficulty: mean(reviews.map((r) => r.difficulty)),
        workload: mean(reviews.map((r) => r.workload)),
        lecture: mean(reviews.map((r) => r.lecture)),
        learning: mean(reviews.map((r) => r.learning)),
        wouldTakeAgainPercent: answered.length
            ? Math.round((100 * answered.filter((r) => r.wouldTakeAgain).length) / answered.length)
            : null,
        distribution: buckets,
    };
}

// background for a 0-5 quality score: green for good, yellow for middling, red for poor
export function qualityColor(score: number): string {
  if (score >= 3.5) return "bg-emerald-200";
  if (score >= 2.5) return "bg-amber-200";
  return "bg-rose-200";
}
