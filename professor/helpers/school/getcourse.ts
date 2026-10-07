import prisma from '../prisma/prisma';
import { matchingIdsFilter } from '../search/text';

async function getCourses(schoolId: number, course?: string) {
    return prisma.course.findMany({
        where: {
            schoolId,
            ...(course ? await matchingIdsFilter('Course', course, schoolId) : {}),
        },
        include: { school: true },
        orderBy: [{ code: 'asc' }, { name: 'asc' }],
    });
}

export default getCourses;
