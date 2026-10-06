import prisma from "../prisma/prisma";
import { searchMode } from "../search/mode";

async function searchProfessors(query : string) {
    // Convert query to lower case
    query = query.toLowerCase();
    
    const professors = await prisma.professor.findMany({
        where: {
            OR: [
                { Firstname: { contains: query, ...searchMode} },
                { Lastname: { contains: query, ...searchMode } }, 
                { Prefix: { contains: query, ...searchMode } }
            ]
        }
    });
    return professors;
}




export default searchProfessors;