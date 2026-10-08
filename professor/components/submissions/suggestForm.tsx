"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDictionary } from "@/components/i18n/provider";
import type { Suggestion } from "@/helpers/search/suggest";

export interface Picked {
  id: number;
  label: string;
}

interface School {
  id: number;
  key: string;
  name: string;
}

const input = "w-full rounded-lg border border-gray-300 p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const label = "mb-1 block text-sm font-medium text-slate-700";

// search box that picks one existing professor or course of the school
function RecordPicker({ type, school, picked, onPick, placeholder }: {
  type: "professor" | "course";
  school: string;
  picked: Picked | null;
  onPick: (picked: Picked | null) => void;
  placeholder: string;
}) {
  const t = useDictionary();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Suggestion[] | null>(null);
  const listId = useId();
  const q = query.trim();

  useEffect(() => {
    if (q.length < 2) {
      setResults(null);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ type, q, school });
        const res = await fetch(`/api/search/suggest?${params}`, { signal: controller.signal });
        const data = res.ok ? await res.json() : [];
        setResults(Array.isArray(data) ? data : []);
      } catch {
        // aborted by a newer keystroke
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, type, school]);

  if (picked) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 p-2">
        <span className="font-medium" style={{ overflowWrap: "anywhere" }}>{picked.label}</span>
        <button type="button" className="shrink-0 text-sm text-blue-700 underline" onClick={() => onPick(null)}>{t.suggestChange}</button>
      </div>
    );
  }
  return (
    <div>
      <input className={input} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder} aria-controls={listId} />
      {results && (
        <ul id={listId} className="mt-1 max-h-60 overflow-auto rounded-lg border border-gray-300 bg-white">
          {results.length === 0 ? (
            <li className="p-2 text-sm text-gray-500">{type === "professor" ? t.noProfessorsFound : t.noCoursesFound}</li>
          ) : results.map((r) => (
            <li key={r.id}>
              <button type="button" className="w-full p-2 text-left hover:bg-blue-50" onClick={() => onPick({ id: r.id, label: r.label })}>
                {r.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// "Already on Profe Rank" / "Not listed yet" switch for one side of the suggestion
function ModeSwitch({ isNew, setNew, name }: { isNew: boolean; setNew: (value: boolean) => void; name: string }) {
  const t = useDictionary();
  const option = (value: boolean, text: string) => (
    <label className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-center text-sm ${isNew === value ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 bg-white"}`}>
      <input type="radio" className="sr-only" name={name} checked={isNew === value} onChange={() => setNew(value)} />
      {text}
    </label>
  );
  return (
    <div className="flex gap-2">
      {option(false, t.suggestExisting)}
      {option(true, t.suggestNew)}
    </div>
  );
}

const SuggestForm: React.FC<{
  schools: School[];
  initialSchoolId: number | null;
  initialProfessor: Picked | null;
  initialCourse: Picked | null;
}> = ({ schools, initialSchoolId, initialProfessor, initialCourse }) => {
  const t = useDictionary();
  const router = useRouter();
  const [schoolId, setSchoolId] = useState<number | null>(initialSchoolId);
  // coming from a professor page means the course is the missing part, and the other way round
  const [newProfessor, setNewProfessor] = useState(!initialProfessor);
  const [newCourse, setNewCourse] = useState(!initialCourse && !!initialProfessor);
  const [professor, setProfessor] = useState<Picked | null>(initialProfessor);
  const [course, setCourse] = useState<Picked | null>(initialCourse);
  const [fields, setFields] = useState({ firstName: "", lastName: "", courseCode: "", courseName: "", department: "", note: "" });
  const [error, setError] = useState("");
  const [duplicates, setDuplicates] = useState<{ label: string; href: string }[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const school = schools.find((s) => s.id === schoolId);
  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields({ ...fields, [key]: e.target.value });
    setDuplicates(null);
  };

  const changeSchool = (id: number | null) => {
    setSchoolId(id);
    setProfessor(null);
    setCourse(null);
    setDuplicates(null);
  };

  const submit = async (confirmed: boolean) => {
    setError("");
    if (!school) return setError(t.errSuggestSchool);
    if (!newProfessor && !professor) return setError(t.errSuggestPickProfessor);
    if (!newCourse && !course) return setError(t.errSuggestPickCourse);

    setBusy(true);
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schoolId: school.id,
        professorId: newProfessor ? null : professor!.id,
        courseId: newCourse ? null : course!.id,
        ...fields,
        confirmed,
      }),
    }).catch(() => null);
    setBusy(false);
    const data = await res?.json().catch(() => ({}));

    if (res?.ok) {
      setSent(true);
      setDuplicates(null);
      setFields({ firstName: "", lastName: "", courseCode: "", courseName: "", department: "", note: "" });
      router.refresh();
      return;
    }
    if (res?.status === 409 && Array.isArray(data?.duplicates)) {
      setDuplicates(data.duplicates);
      if (data.error) setError(data.error);
      return;
    }
    setError(data?.error || t.actionFailed);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">
        <p className="font-semibold">{t.suggestThanks}</p>
        <button type="button" className="text-blue-700 underline" onClick={() => setSent(false)}>{t.suggestAnother}</button>
      </div>
    );
  }

  const codeTaken = !!error && error === t.errSuggestCodeTaken;
  return (
    <form
      className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-4 md:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        submit(false);
      }}
    >
      <div>
        <label className={label} htmlFor="suggest-school">{t.suggestSchool}</label>
        <select
          id="suggest-school"
          className={input}
          value={schoolId ?? ""}
          onChange={(e) => changeSchool(e.target.value ? parseInt(e.target.value, 10) : null)}
        >
          <option value="">{t.suggestChooseSchool}</option>
          {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {school && (
        <>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-lg font-semibold">{t.suggestProfessorHeading}</legend>
            <ModeSwitch isNew={newProfessor} setNew={(v) => { setNewProfessor(v); setDuplicates(null); }} name="professor-mode" />
            {newProfessor ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={label} htmlFor="suggest-first">{t.suggestFirstName}</label>
                  <input id="suggest-first" className={input} value={fields.firstName} onChange={set("firstName")} maxLength={60} required autoComplete="off" />
                </div>
                <div>
                  <label className={label} htmlFor="suggest-last">{t.suggestLastName}</label>
                  <input id="suggest-last" className={input} value={fields.lastName} onChange={set("lastName")} maxLength={60} required autoComplete="off" />
                </div>
              </div>
            ) : (
              <RecordPicker type="professor" school={school.key} picked={professor} onPick={setProfessor} placeholder={t.searchProfessorOption} />
            )}
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-lg font-semibold">{t.suggestCourseHeading}</legend>
            <ModeSwitch isNew={newCourse} setNew={(v) => { setNewCourse(v); setDuplicates(null); }} name="course-mode" />
            {newCourse ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className={label} htmlFor="suggest-code">{t.suggestCourseCode}</label>
                  <input id="suggest-code" className={input} value={fields.courseCode} onChange={set("courseCode")} maxLength={20} placeholder="MAT 1001" autoComplete="off" />
                </div>
                <div className="sm:col-span-2">
                  <label className={label} htmlFor="suggest-course-name">{t.suggestCourseName}</label>
                  <input id="suggest-course-name" className={input} value={fields.courseName} onChange={set("courseName")} maxLength={120} required autoComplete="off" />
                </div>
                <div className="sm:col-span-3">
                  <label className={label} htmlFor="suggest-department">{t.suggestDepartment}</label>
                  <input id="suggest-department" className={input} value={fields.department} onChange={set("department")} maxLength={80} autoComplete="off" />
                </div>
              </div>
            ) : (
              <RecordPicker type="course" school={school.key} picked={course} onPick={setCourse} placeholder={t.searchCourseOption} />
            )}
          </fieldset>

          <div>
            <label className={label} htmlFor="suggest-note">{t.suggestNote}</label>
            <textarea id="suggest-note" className={input} rows={2} value={fields.note} onChange={set("note")} maxLength={300} />
          </div>
        </>
      )}

      {error && <p className="text-red-700" role="alert">{error}</p>}

      {duplicates ? (
        <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="font-semibold">{codeTaken ? t.suggestCodeTakenHint : t.suggestDuplicatesHint}</p>
          <ul className="list-disc pl-5">
            {duplicates.map((d) => (
              <li key={d.href}><Link className="text-blue-700 underline" href={d.href}>{d.label}</Link></li>
            ))}
          </ul>
          {!codeTaken && (
            <button type="button" disabled={busy} onClick={() => submit(true)} className="min-h-11 self-start rounded-lg bg-slate-800 px-4 py-2 text-white disabled:opacity-50">
              {t.suggestSubmitAnyway}
            </button>
          )}
        </div>
      ) : (
        school && (
          <button type="submit" disabled={busy} className="min-h-11 self-start rounded-full bg-blue-600 px-8 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            {t.suggestSubmit}
          </button>
        )
      )}
    </form>
  );
};

export default SuggestForm;
