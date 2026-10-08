import { Dictionary, format } from "../i18n/dictionaries";

export const SCORE_FIELDS = ["overallRating", "difficulty", "workload", "lecture", "learning"] as const;
export const MAX_COMMENT_LENGTH = 500;

export type ReviewContent = Record<(typeof SCORE_FIELDS)[number], number> & { wouldTakeAgain: boolean | null; comment: string };

// scores come from half-star inputs, so they must be 0.5 to 5 in steps of 0.5
function isValidScore(value: unknown): value is number {
    return typeof value === "number" && value >= 0.5 && value <= 5 && Number.isInteger(value * 2);
}

export function isValidId(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value) && value > 0;
}

// checks the scores and comment of a new or edited review; returns the cleaned values or an error message
export function validateReviewContent(body: any, t: Dictionary): { content: ReviewContent } | { error: string } {
    for (const field of SCORE_FIELDS) {
        if (!isValidScore(body?.[field])) {
            return { error: t.errScores };
        }
    }
    // optional yes/no; anything other than true or false counts as not answered
    const wouldTakeAgain = typeof body?.wouldTakeAgain === "boolean" ? body.wouldTakeAgain : null;
    const comment = body?.comment;
    if (typeof comment !== "string" || comment.trim() === "") {
        return { error: t.errEmptyComment };
    }
    if (comment.length > MAX_COMMENT_LENGTH) {
        return { error: format(t.errLongComment, { max: MAX_COMMENT_LENGTH }) };
    }
    return {
        content: {
            overallRating: body.overallRating,
            difficulty: body.difficulty,
            workload: body.workload,
            lecture: body.lecture,
            learning: body.learning,
            wouldTakeAgain,
            comment: comment.trim(),
        },
    };
}
