import prisma from "../prisma/prisma";
import { searchMode } from "../search/mode";

// every word must match some part of the name, so "dr jane doe" and "doe jane" both work
export function professorNameFilter(query: string) {
    const words = query.trim().split(/\s+/).filter(Boolean);
    return {
        AND: words.map((word) => ({
            OR: [
                { Firstname: { contains: word, ...searchMode } },
                { Lastname: { contains: word, ...searchMode } },
                { Prefix: { contains: word, ...searchMode } }
            ]
        }))
    };
}

async function searchProfessors(query : string) {
    const professors = await prisma.professor.findMany({
        where: professorNameFilter(query)
    });
    return professors;
}

export default searchProfessors;
