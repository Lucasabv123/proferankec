"use client";

import { useDictionary } from "@/components/i18n/provider";
import { format } from "@/helpers/i18n/dictionaries";
import type { RatingSummary } from "@/helpers/reviews/summary";
import { StaticStarRating } from "./reviewcard";

// the big "4.9 / 5" with the number of ratings it is based on
export const ScoreHeadline: React.FC<{ summary: RatingSummary; scope?: string }> = ({ summary, scope }) => {
  const t = useDictionary();
  const ratings = summary.count === 1 ? t.oneRating : format(t.manyRatings, { count: summary.count });
  return (
    <div>
      <div className="flex items-start gap-2">
        <span className="text-6xl md:text-7xl font-black leading-none tabular-nums">
          {summary.count ? summary.average.toFixed(1) : "–"}
        </span>
        <span className="mt-1 text-lg font-semibold text-slate-400">/ 5</span>
      </div>
      {summary.count > 0 && (
        <div className="mt-2 [&_.static-rating]:text-2xl">
          <StaticStarRating rating={summary.average} />
        </div>
      )}
      <p className="mt-3 font-semibold">
        {t.overallQualityBasedOn} <a href="#ratings" className="underline">{ratings}</a>
        {scope ? ` ${scope}` : ""}
      </p>
    </div>
  );
};

// "97% Would take again | 2.4 Level of difficulty"
export const StatPair: React.FC<{ summary: RatingSummary }> = ({ summary }) => {
  const t = useDictionary();
  return (
    <div className="flex divide-x divide-slate-300">
      <div className="pr-6 text-center">
        <div className="text-3xl font-black tabular-nums">
          {summary.wouldTakeAgainPercent === null ? "–" : `${summary.wouldTakeAgainPercent}%`}
        </div>
        <div className="text-sm text-slate-600">{t.wouldTakeAgain}</div>
      </div>
      <div className="pl-6 text-center">
        <div className="text-3xl font-black tabular-nums">{summary.count ? summary.difficulty.toFixed(1) : "–"}</div>
        <div className="text-sm text-slate-600">{t.levelOfDifficulty}</div>
      </div>
    </div>
  );
};

// one bar per star level, as long as its share of the ratings
export const Distribution: React.FC<{ summary: RatingSummary }> = ({ summary }) => {
  const t = useDictionary();
  const labels: Record<number, string> = { 5: t.starAwesome, 4: t.starGreat, 3: t.starGood, 2: t.starOk, 1: t.starAwful };
  const max = Math.max(1, ...summary.distribution.map((d) => d.count));
  return (
    <div className="review-card w-full self-start p-5">
      <h2 className="mb-4 font-semibold">{t.ratingDistribution}</h2>
      <ul className="flex flex-col gap-3">
        {summary.distribution.map(({ stars, count }) => (
          <li key={stars} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-right text-sm">
              {labels[stars]} <strong>{stars}</strong>
            </span>
            <span className="h-7 flex-1 rounded bg-slate-200" aria-hidden="true">
              <span className="block h-full rounded bg-blue-600" style={{ width: `${(100 * count) / max}%` }} />
            </span>
            <span className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
