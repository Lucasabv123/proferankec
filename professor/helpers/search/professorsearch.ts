import prisma from "../prisma/prisma";
import { matchingIdsFilter } from "./text";

// every word must match some part of the name, ignoring accents, so "perez jane" finds "Jane Pérez"
async function searchProfessors(query : string) {
    const professors = await prisma.professor.findMany({
        where: await matchingIdsFilter("Professor", query),
        orderBy: [{ Lastname: "asc" }, { Firstname: "asc" }],
    });
    return professors;
}

export default searchProfessors;
