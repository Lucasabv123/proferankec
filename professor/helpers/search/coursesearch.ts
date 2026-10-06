import prisma from "../prisma/prisma";

async function searchCourses(query : string) {
    // covert to lower case
    query = query.toLowerCase();
    
    const courses = await prisma.course.findMany({
        where: {
            name: {
                contains: query,
            }
        }
    });
    return courses;

}
export default searchCourses;