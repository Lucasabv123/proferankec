import prisma from "../prisma/prisma";
import { courseTextFilter } from "../school/getcourse";

async function searchCourses(query : string) {
    const courses = await prisma.course.findMany({
        where: courseTextFilter(query),
        include: { school: true },
    });
    return courses;

}
export default searchCourses;
