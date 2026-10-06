import prisma from "../prisma/prisma";
import { searchMode } from "../search/mode";

async function searchCourses(query : string) {
    const courses = await prisma.course.findMany({
        where: {
            name: {
                contains: query.trim(), ...searchMode
            }
        }
    });
    return courses;

}
export default searchCourses;