import prisma from "@/helpers/prisma/prisma"; 

type CourseProfessor = {
    course: {
        School: string;
    };
};

type Professor = {
    id: number; 
    Firstname?: string; 
    Lastname?: string; 
    Prefix?: string;
    Verified?: boolean;
    Courses?: CourseProfessor[]; 
};


export const getSchools = async ( professor: Professor ): Promise<string[]> => {
    const profSchools = await prisma.professor.findUnique(
        {
            where: {
                id: professor.id
            },
            select: {
                courses: {
                    select: {
                        course: {
                            select: {
                                School: true
                            }
                        }
                    }
                }
            }
        }
    );
    const schools = profSchools.courses.map(courseprof => courseprof.course.School); 
    const uniqueSchools = Array.from(new Set(schools));
    return uniqueSchools;

}