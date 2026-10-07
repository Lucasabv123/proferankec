"use client";

import { Field, Label, Textarea } from "@headlessui/react";
import StarRating from "./rating";
import { useDictionary } from "@/components/i18n/provider";

export type ReviewDraft = {
  overallRating: number;
  difficulty: number;
  workload: number;
  lecture: number;
  learning: number;
  comment: string;
};

export const EMPTY_DRAFT: ReviewDraft = { overallRating: 0, difficulty: 0, workload: 0, lecture: 0, learning: 0, comment: "" };

// the star ratings and comment box shared by the new-review and edit-review forms
const ReviewFields: React.FC<{ value: ReviewDraft; onChange: (draft: ReviewDraft) => void }> = ({ value, onChange }) => {
  const t = useDictionary();
  const set = (field: keyof ReviewDraft) => (v: number | string) => onChange({ ...value, [field]: v });

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <h1 className="text-gray-700 font-semibold mb-2">{t.difficulty}</h1>
          <StarRating rating={value.difficulty} onRatingChange={set("difficulty")} />
        </div>

        <div>
          <h1 className="text-gray-700 font-semibold mb-2">{t.workload}</h1>
          <StarRating rating={value.workload} onRatingChange={set("workload")} />
        </div>

        <div>
          <h1 className="text-gray-700 font-semibold mb-2">{t.lectureQuality}</h1>
          <StarRating rating={value.lecture} onRatingChange={set("lecture")} />
        </div>

        <div>
          <h1 className="text-gray-700 font-semibold mb-2">{t.learningValue}</h1>
          <StarRating rating={value.learning} onRatingChange={set("learning")} />
        </div>

        <div className="sm:col-span-2">
          <h1 className="text-gray-700 font-semibold mb-2">{t.overallRating}</h1>
          <StarRating rating={value.overallRating} onRatingChange={set("overallRating")} />
        </div>
      </div>

      <div className="mb-6">
        <Field>
          <Label className="block text-gray-700 font-semibold mb-2">{t.comment}</Label>
          <Textarea
            value={value.comment}
            onChange={(e) => set("comment")(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Field>
      </div>
    </>
  );
};

export default ReviewFields;
