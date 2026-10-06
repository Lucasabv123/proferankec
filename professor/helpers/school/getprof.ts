import prisma from '../prisma/prisma';
import { professorNameFilter } from '../search/professorsearch';

async function getProfessors(schoolId: number, professor?: string) {
    return prisma.professor.findMany({
        where: {
            schoolId,
            ...(professor ? professorNameFilter(professor) : {}),
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
