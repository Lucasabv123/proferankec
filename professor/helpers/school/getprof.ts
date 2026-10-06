import prisma from '../prisma/prisma';
import { professorNameFilter } from '../search/professorsearch';



async function getProfessors(school: string, professor?: string) {
    try {
        const professors = await prisma.professor.findMany({
            where: {
                courses: {
                    some: {
                        course: {
                            School: school,
                        },
                    },
                },
                ...(professor ? professorNameFilter(professor) : {}),
            },
            select: {
                id: true,
                Firstname: true,
                Lastname: true,
                Prefix: true,
            },
        });

        return professors;
    } catch (error) {
        console.error('Failed to retrieve professors for the school:', error);
        throw error;
    }
}

export default getProfessors;