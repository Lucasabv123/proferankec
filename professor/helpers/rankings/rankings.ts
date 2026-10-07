import prisma from "../prisma/prisma";

// a professor or course needs this many visible reviews before it can be ranked,
// so one glowing review can't put someone at the top
export const MIN_REVIEWS_TO_RANK = 3;
const RANKING_SIZE = 10;

export type Ranked<T> = { item: T; average: number; reviewCount: number };

type Score = { id: number; average: number; reviewCount: number };

// highest average overall rating first; ties go to the one with more reviews
async function rankProfessors(schoolId: number): Promise<Score[]> {
    const groups = await prisma.review.groupBy({
        by: ["professorId"],
        where: { hidden: false, professor: { schoolId } },
        _avg: { overallRating: true },
        _count: { _all: true },
        having: { professorId: { _count: { gte: MIN_REVIEWS_TO_RANK } } },
        orderBy: [{ _avg: { overallRating: "desc" } }, { _count: { professorId: "desc" } }],
        take: RANKING_SIZE,
    });
    return groups.map((g) => ({ id: g.professorId, average: g._avg.overallRating ?? 0, reviewCount: g._count._all }));
}

async function rankCourses(schoolId: number): Promise<Score[]> {
    const groups = await prisma.review.groupBy({
        by: ["courseId"],
        where: { hidden: false, course: { schoolId } },
        _avg: { overallRating: true },
        _count: { _all: true },
        having: { courseId: { _count: { gte: MIN_REVIEWS_TO_RANK } } },
        orderBy: [{ _avg: { overallRating: "desc" } }, { _count: { courseId: "desc" } }],
        take: RANKING_SIZE,
    });
    return groups.map((g) => ({ id: g.courseId, average: g._avg.overallRating ?? 0, reviewCount: g._count._all }));
}

function attach<T extends { id: number }>(ranked: Score[], items: T[]): Ranked<T>[] {
    const byId = new Map(items.map((item) => [item.id, item]));
    return ranked
        .filter((r) => byId.has(r.id))
        .map((r) => ({ item: byId.get(r.id)!, average: r.average, reviewCount: r.reviewCount }));
}

export async function getTopProfessors(schoolId: number) {
    const ranked = await rankProfessors(schoolId);
    const professors = await prisma.professor.findMany({
        where: { id: { in: ranked.map((r) => r.id) } },
        select: { id: true, Prefix: true, Firstname: true, Lastname: true },
    });
    return attach(ranked, professors);
}

export async function getTopCourses(schoolId: number) {
    const ranked = await rankCourses(schoolId);
    const courses = await prisma.course.findMany({
        where: { id: { in: ranked.map((r) => r.id) } },
        select: { id: true, code: true, name: true, Department: true },
    });
    return attach(ranked, courses);
}
