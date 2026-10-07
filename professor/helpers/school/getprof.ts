import prisma from '../prisma/prisma';
import { matchingIdsFilter } from '../search/text';

async function getProfessors(schoolId: number, professor?: string) {
    return prisma.professor.findMany({
        where: {
            schoolId,
            ...(professor ? await matchingIdsFilter('Professor', professor, schoolId) : {}),
        },
        select: {
            id: true,
            Firstname: true,
            Lastname: true,
            Prefix: true,
        },
        orderBy: [{ Lastname: 'asc' }, { Firstname: 'asc' }],
    });
}

export default getProfessors;
