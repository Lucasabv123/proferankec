import prisma from '../prisma/prisma';
import { searchMode } from '../search/mode';

// matches the course name or its catalog code ("ART 1101")
export function courseTextFilter(query: string) {
    const q = query.trim();
    return {
        OR: [
            { name: { contains: q, ...searchMode } },
            { code: { contains: q, ...searchMode } },
        ],
    };
}

async function getCourses(schoolId: number, course?: string) {
    return prisma.course.findMany({
        where: {
            schoolId,
            ...(course ? courseTextFilter(course) : {}),
        },
        include: { school: true },
        orderBy: [{ code: 'asc' }, { name: 'asc' }],
    });
}

export default getCourses;
