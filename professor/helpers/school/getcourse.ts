import prisma from '../prisma/prisma';  




async function getCourses(school: string, course?: string) {
    
    let c = []; 
    
    try {
        if(course){
            c = await prisma.course.findMany({
                where: {
                    School: school,
                    name: {
                        contains: course.toLowerCase(),
                    }
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    Department: true,
                },
            })
        }else{
            c = await prisma.course.findMany({
                where: {
                    School: school,
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    Department: true,
                },
            });
        }
        const courses = c; 
        return courses;
    } catch (error) {
        console.error('Failed to retrieve courses for the school:', error);
        throw error;
    }
}

export default getCourses;


