import prisma from "../prisma/prisma";
import { matchingIdsFilter } from "./text";

// matches the course name or its catalog code ("ART 1101"), ignoring accents
async function searchCourses(query : string) {
    const courses = await prisma.course.findMany({
        where: await matchingIdsFilter("Course", query),
        include: { school: true },
        orderBy: [{ code: "asc" }, { name: "asc" }],
    });
    return courses;

}
export default searchCourses;
