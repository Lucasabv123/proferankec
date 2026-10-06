"use client";

import { useState } from "react";
import { useDictionary } from "@/components/i18n/provider";

const ReportButton: React.FC<{ reviewId: number }> = ({ reviewId }) => {
  const t = useDictionary();
  const [sent, setSent] = useState(false);

  const handleReport = async () => {
    const reason = window.prompt(t.reportPrompt);
    if (reason === null) return; // cancelled
    const res = await fetch("/api/review/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId, reason }),
    });
    const data = await res.json().catch(() => null);
    if (res.ok) {
      setSent(true);
      alert(t.reportThanks);
    } else {
      alert(data?.error ?? t.reportFailed);
    }
  };

  return (
    <button
      onClick={handleReport}
      disabled={sent}
      className="text-sm text-gray-500 underline hover:text-red-600 disabled:no-underline disabled:text-gray-400"
    >
      {t.reportReview}
    </button>
  );
};

export default ReportButton;
