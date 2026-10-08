"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDictionary } from "@/components/i18n/provider";

export interface NewFields {
  firstName: string;
  lastName: string;
  courseCode: string;
  courseName: string;
  department: string;
}

// approve or reject a student's suggestion; the names of new records can be fixed first
const SubmissionActions: React.FC<{
  submissionId: number;
  newProfessor: boolean;
  newCourse: boolean;
  initial: NewFields;
}> = ({ submissionId, newProfessor, newCourse, initial }) => {
  const t = useDictionary();
  const router = useRouter();
  const [fields, setFields] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const act = async (action: "approve" | "reject") => {
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId, action, edits: action === "approve" ? fields : undefined }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) {
      router.refresh();
    } else {
      const data = await res?.json().catch(() => null);
      setError(data?.error || t.actionFailed);
    }
  };

  const field = (key: keyof NewFields, text: string) => (
    <label className="block text-sm">
      <span className="text-slate-600">{text}</span>
      <input
        className="mt-1 w-full rounded border border-gray-300 p-2"
        value={fields[key]}
        onChange={(e) => setFields({ ...fields, [key]: e.target.value })}
      />
    </label>
  );

  const button = "min-h-11 px-4 py-2 rounded shadow text-sm disabled:opacity-50";
  return (
    <div className="flex flex-col gap-3">
      {(newProfessor || newCourse) && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {newProfessor && field("firstName", t.suggestFirstName)}
          {newProfessor && field("lastName", t.suggestLastName)}
          {newCourse && field("courseCode", t.suggestCourseCode)}
          {newCourse && field("courseName", t.suggestCourseName)}
          {newCourse && field("department", t.suggestDepartment)}
        </div>
      )}
      {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
      <div className="flex gap-2">
        <button disabled={busy} onClick={() => act("approve")} className={`${button} bg-green-600 text-white hover:bg-green-700`}>{t.approve}</button>
        <button disabled={busy} onClick={() => act("reject")} className={`${button} bg-gray-200 hover:bg-gray-300`}>{t.reject}</button>
      </div>
    </div>
  );
};

export default SubmissionActions;
