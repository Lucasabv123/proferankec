"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useDictionary } from "@/components/i18n/provider";
import ReviewFields, { ReviewDraft } from "./reviewFields";

// Edit and Delete buttons shown on the signed-in user's own reviews
const OwnReviewActions: React.FC<{ reviewId: number; initial: ReviewDraft }> = ({ reviewId, initial }) => {
  const t = useDictionary();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<ReviewDraft>(initial);
  const [busy, setBusy] = useState(false);

  const send = async (method: "PATCH" | "DELETE", body?: ReviewDraft) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/review/${reviewId}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? t.actionFailed);
        return false;
      }
      router.refresh();
      return true;
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await send("PATCH", draft)) setIsOpen(false);
  };

  const handleDelete = async () => {
    if (window.confirm(t.deleteReviewConfirm)) await send("DELETE");
  };

  const openEditor = () => {
    setDraft(initial); // start from the saved review, not an abandoned edit
    setIsOpen(true);
  };

  return (
    <>
      <span className="text-sm text-gray-500">{t.yourReview}</span>
      <button onClick={openEditor} disabled={busy} className="text-sm underline hover:text-blue-600 disabled:text-gray-400">
        {t.editReview}
      </button>
      <button onClick={handleDelete} disabled={busy} className="text-sm underline hover:text-red-600 disabled:text-gray-400">
        {t.deleteReview}
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-white p-4 sm:p-6 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto text-left">
            <DialogTitle className="text-xl font-semibold text-gray-800 mb-4">{t.editReviewTitle}</DialogTitle>
            <form onSubmit={handleSave}>
              <ReviewFields value={draft} onChange={setDraft} />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600 disabled:bg-blue-300"
                >
                  {t.saveChanges}
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default OwnReviewActions;
