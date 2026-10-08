import prisma from "../prisma/prisma";
import { Dictionary } from "../i18n/dictionaries";
import { coursePath, professorName, professorPath } from "../links";
import { findMatchingIds } from "../search/text";
import { isValidId } from "../reviews/validate";

// Students suggest a professor and a course the professor teaches. Each side is either an existing
// record or a new one, so a suggestion can add a professor, a course, both, or only the pairing
// (reviews need the pairing). Admins approve or reject suggestions on /admin.

export const MAX_PENDING_PER_USER = 10;
const MAX_NAME = 60;
const MAX_COURSE_NAME = 120;
const MAX_CODE = 20;
const MAX_DEPARTMENT = 80;
export const MAX_NOTE = 300;

// the parts of a suggestion that describe new records; an admin can correct these before approving
export interface NewRecordFields {
    firstName: string | null;
    lastName: string | null;
    courseCode: string | null;
    courseName: string | null;
    department: string | null;
}

export interface CleanSubmission extends NewRecordFields {
    schoolId: number;
    professorId: number | null;
    courseId: number | null;
    note: string | null;
}

export interface PossibleDuplicate {
    label: string;
    href: string;
}

// trims and collapses spaces; empty becomes null
function cleanText(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const text = value.replace(/\s+/g, " ").trim();
    return text === "" ? null : text;
}

// catalog codes are compared as "ART 1101" whatever the spacing or case
export function normalizeCode(code: string): string {
    return code.replace(/\s+/g, " ").trim().toUpperCase();
}

// checks the new-record fields for the sides that aren't existing records
export function validateNewFields(
    fields: Partial<Record<keyof NewRecordFields, unknown>>,
    sides: { newProfessor: boolean; newCourse: boolean },
    t: Dictionary,
): { fields: NewRecordFields } | { error: string } {
    const firstName = sides.newProfessor ? cleanText(fields.firstName) : null;
    const lastName = sides.newProfessor ? cleanText(fields.lastName) : null;
    const courseName = sides.newCourse ? cleanText(fields.courseName) : null;
    const code = sides.newCourse ? cleanText(fields.courseCode) : null;
    const department = sides.newCourse ? cleanText(fields.department) : null;

    if (sides.newProfessor && (!firstName || !lastName)) return { error: t.errSuggestProfessorName };
    if ((firstName?.length ?? 0) > MAX_NAME || (lastName?.length ?? 0) > MAX_NAME) return { error: t.errSuggestTooLong };
    if (sides.newCourse && !courseName) return { error: t.errSuggestCourseName };
    if ((courseName?.length ?? 0) > MAX_COURSE_NAME || (code?.length ?? 0) > MAX_CODE || (department?.length ?? 0) > MAX_DEPARTMENT) {
        return { error: t.errSuggestTooLong };
    }
    return { fields: { firstName, lastName, courseName, courseCode: code ? normalizeCode(code) : null, department } };
}

// checks a student's suggestion from the form; returns the cleaned values or an error message
export async function validateSubmission(body: any, t: Dictionary): Promise<{ submission: CleanSubmission } | { error: string }> {
    if (!isValidId(body?.schoolId)) return { error: t.errSuggestSchool };
    const school = await prisma.school.findUnique({ where: { id: body.schoolId } });
    if (!school) return { error: t.errSuggestSchool };

    const professorId = body?.professorId == null ? null : body.professorId;
    const courseId = body?.courseId == null ? null : body.courseId;
    if (professorId !== null) {
        const professor = isValidId(professorId) ? await prisma.professor.findUnique({ where: { id: professorId } }) : null;
        if (!professor || professor.schoolId !== school.id) return { error: t.errSuggestPickProfessor };
    }
    if (courseId !== null) {
        const course = isValidId(courseId) ? await prisma.course.findUnique({ where: { id: courseId } }) : null;
        if (!course || course.schoolId !== school.id) return { error: t.errSuggestPickCourse };
    }

    const checked = validateNewFields(body ?? {}, { newProfessor: professorId === null, newCourse: courseId === null }, t);
    if ("error" in checked) return checked;

    if (professorId !== null && courseId !== null) {
        const pairing = await prisma.courseProfessor.findUnique({ where: { courseId_professorId: { courseId, professorId } } });
        if (pairing) return { error: t.errSuggestAlreadyListed };
    }

    const note = cleanText(body?.note);
    if ((note?.length ?? 0) > MAX_NOTE) return { error: t.errSuggestTooLong };

    return { submission: { schoolId: school.id, professorId, courseId, note, ...checked.fields } };
}

// existing courses in the school whose catalog code is exactly this one
async function coursesWithCode(schoolId: number, code: string) {
    const ids = (await findMatchingIds("Course", code, { schoolId, limit: 20 })) ?? [];
    const courses = ids.length ? await prisma.course.findMany({ where: { id: { in: ids } } }) : [];
    return courses.filter((c) => c.code && normalizeCode(c.code) === code);
}

// A course code must be new to the school; returns the course that already has it, if any.
export async function takenCourseCode(schoolId: number, code: string | null) {
    if (!code) return null;
    return (await coursesWithCode(schoolId, code))[0] ?? null;
}

// existing professors or courses that look like the new ones, so students can pick those instead
export async function findPossibleDuplicates(s: CleanSubmission): Promise<PossibleDuplicate[]> {
    const found: PossibleDuplicate[] = [];
    if (s.professorId === null && s.firstName && s.lastName) {
        const ids = (await findMatchingIds("Professor", `${s.firstName} ${s.lastName}`, { schoolId: s.schoolId, limit: 5 })) ?? [];
        // two surnames are common, so also try the first name with each surname
        for (const surname of s.lastName.split(" ").slice(0, 2)) {
            if (ids.length >= 5) break;
            const more = (await findMatchingIds("Professor", `${s.firstName} ${surname}`, { schoolId: s.schoolId, limit: 5 })) ?? [];
            more.forEach((id) => ids.includes(id) || ids.push(id));
        }
        const professors = ids.length ? await prisma.professor.findMany({ where: { id: { in: ids.slice(0, 5) } } }) : [];
        professors.forEach((p) => found.push({ label: p.displayName || professorName(p), href: professorPath(p) }));
    }
    if (s.courseId === null && s.courseName) {
        const ids = (await findMatchingIds("Course", s.courseName, { schoolId: s.schoolId, limit: 5 })) ?? [];
        const courses = ids.length ? await prisma.course.findMany({ where: { id: { in: ids } } }) : [];
        courses.forEach((c) => found.push({ label: c.code ? `${c.code} · ${c.name}` : c.name, href: coursePath(c) }));
    }
    return found;
}

// Creates whatever the suggestion adds and links the professor to the course. `edits` are the
// admin's corrections to the new-record fields. Throws an Error whose message is shown to the admin.
export async function approveSubmission(submissionId: number, edits: Partial<Record<keyof NewRecordFields, unknown>> | null, t: Dictionary) {
    const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
    if (!submission || submission.status !== "pending") throw new Error(t.errSuggestNotPending);

    const sides = { newProfessor: submission.professorId === null, newCourse: submission.courseId === null };
    const checked = validateNewFields({ ...submission, ...(edits ?? {}) }, sides, t);
    if ("error" in checked) throw new Error(checked.error);
    const f = checked.fields;

    if (sides.newCourse && (await takenCourseCode(submission.schoolId, f.courseCode))) {
        throw new Error(t.errSuggestCodeTaken);
    }

    return prisma.$transaction(async (tx) => {
        const professorId = submission.professorId ?? (await tx.professor.create({
            data: { Firstname: f.firstName!, Lastname: f.lastName!, schoolId: submission.schoolId, userAdded: true },
        })).id;
        const courseId = submission.courseId ?? (await tx.course.create({
            data: { name: f.courseName!, code: f.courseCode, Department: f.department ?? "", schoolId: submission.schoolId, userAdded: true },
        })).id;
        await tx.courseProfessor.upsert({
            where: { courseId_professorId: { courseId, professorId } },
            update: {},
            create: { courseId, professorId },
        });
        return tx.submission.update({
            where: { id: submission.id },
            data: { ...f, professorId, courseId, status: "approved", reviewedAt: new Date() },
        });
    });
}
