import prisma from "../prisma/prisma";
import { searchMode } from "../search/mode";

async function searchCourses(query : string) {
    // covert to lower case
    query = query.toLowerCase();
    
    const courses = await prisma.course.findMany({
        where: {
            name: {
                contains: query, ...searchMode
            }
        }
    });
    return courses;

}
export default searchCourses;