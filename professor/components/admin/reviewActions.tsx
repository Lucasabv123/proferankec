"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDictionary } from "@/components/i18n/provider";

const ReviewActions: React.FC<{ reviewId: number; hidden: boolean }> = ({ reviewId, hidden }) => {
  const t = useDictionary();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const act = async (action: "hide" | "unhide" | "dismiss") => {
    setBusy(true);
    const res = await fetch("/api/admin/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId, action }),
    });
    setBusy(false);
    if (res.ok) {
      router.refresh();
    } else {
      alert(t.actionFailed);
    }
  };

  const button = "px-3 py-1 rounded shadow text-sm disabled:opacity-50";
  return (
    <div className="flex gap-2">
      {hidden ? (
        <button disabled={busy} onClick={() => act("unhide")} className={`${button} bg-gray-200 hover:bg-gray-300`}>{t.unhide}</button>
      ) : (
        <button disabled={busy} onClick={() => act("hide")} className={`${button} bg-red-600 text-white hover:bg-red-700`}>{t.hide}</button>
      )}
      <button disabled={busy} onClick={() => act("dismiss")} className={`${button} bg-gray-200 hover:bg-gray-300`}>{t.dismissReports}</button>
    </div>
  );
};

export default ReviewActions;
