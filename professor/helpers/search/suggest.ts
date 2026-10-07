import prisma from "../prisma/prisma";
import { coursePath, professorPath, schoolPath } from "../links";
import { findMatchingIds } from "./text";

export type SuggestType = "professor" | "course" | "school";

export interface Suggestion {
    label: string;
    detail: string;
    href: string;
}

const LIMIT = 8;

// the first few matches for the search bar's dropdown, already linked to their pages
// schoolId limits professors and courses to one university (the school page's search box)
async function getSuggestions(type: SuggestType, query: string, schoolId?: number): Promise<Suggestion[]> {
    if (type === "professor") {
        const ids = await findMatchingIds("Professor", query, { schoolId, limit: LIMIT });
        if (!ids?.length) return [];
        const professors = await prisma.professor.findMany({ where: { id: { in: ids } }, include: { school: true } });
        return sortByIds(professors, ids).map((p) => ({
            label: p.displayName || [p.Prefix, p.Firstname, p.Lastname].filter(Boolean).join(" "),
            detail: p.school.name,
            href: professorPath(p),
        }));
    }
    if (type === "course") {
        const ids = await findMatchingIds("Course", query, { schoolId, limit: LIMIT });
        if (!ids?.length) return [];
        const courses = await prisma.course.findMany({ where: { id: { in: ids } }, include: { school: true } });
        return sortByIds(courses, ids).map((c) => ({
            label: c.code ? `${c.code} · ${c.name}` : c.name,
            detail: c.school.name,
            href: coursePath(c),
        }));
    }
    const ids = await findMatchingIds("School", query, { limit: LIMIT });
    if (!ids?.length) return [];
    const schools = await prisma.school.findMany({ where: { id: { in: ids } } });
    return sortByIds(schools, ids).map((s) => ({ label: s.name, detail: s.key.toUpperCase(), href: schoolPath(s) }));
}

// findMany doesn't keep the order of an `in` list
function sortByIds<T extends { id: number }>(rows: T[], ids: number[]): T[] {
    const position = new Map(ids.map((id, i) => [id, i]));
    return [...rows].sort((a, b) => position.get(a.id)! - position.get(b.id)!);
}

export default getSuggestions;
