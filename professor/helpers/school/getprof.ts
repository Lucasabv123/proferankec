import prisma from '../prisma/prisma';



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
                        { Firstname: { contains: professor.toLowerCase() } },
                        { Lastname: { contains: professor.toLowerCase() } },
                        { Prefix: { contains: professor.toLowerCase() } },
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