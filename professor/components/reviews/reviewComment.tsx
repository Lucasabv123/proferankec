"use client";

import { useState } from "react";
import { useDictionary } from "@/components/i18n/provider";

// a review's comment, with a button to read it machine-translated into the visitor's language
const ReviewComment: React.FC<{ reviewId?: number; comment?: string; canTranslate?: boolean }> = ({ reviewId, comment, canTranslate = false }) => {
  const t = useDictionary();
  const [translation, setTranslation] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (translation !== null) {
      setShowTranslation(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/review/${reviewId}/translate`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (res.ok && typeof data?.translation === "string") {
        setTranslation(data.translation);
        setShowTranslation(true);
      } else {
        alert(data?.error ?? t.translateFailed);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!comment) return null;

  return (
    <div>
      <p className="text-gray-700 text-sm md:text-base">{showTranslation ? translation : comment}</p>
      {canTranslate && reviewId ? (
        <button
          onClick={showTranslation ? () => setShowTranslation(false) : handleTranslate}
          disabled={loading}
          className="mt-1 text-sm text-gray-500 underline hover:text-blue-600 disabled:no-underline"
        >
          {loading ? t.translating : showTranslation ? t.showOriginal : t.translate}
        </button>
      ) : null}
      {showTranslation ? <p className="text-xs text-gray-400 mt-1">{t.machineTranslated}</p> : null}
    </div>
  );
};

export default ReviewComment;
