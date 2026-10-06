import prisma from '../prisma/prisma';
import { searchMode } from '../search/mode';



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
                OR: professor
                    ? [
                        { Firstname: { contains: professor.toLowerCase(), ...searchMode } },
                        { Lastname: { contains: professor.toLowerCase(), ...searchMode } },
                        { Prefix: { contains: professor.toLowerCase(), ...searchMode } },
                    ]
                    : undefined,
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