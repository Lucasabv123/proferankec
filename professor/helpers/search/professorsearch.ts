import prisma from "../prisma/prisma";

async function searchProfessors(query : string) {
    // Convert query to lower case
    query = query.toLowerCase();
    
    const professors = await prisma.professor.findMany({
        where: {
            OR: [
                { Firstname: { contains: query} },
                { Lastname: { contains: query } }, 
                { Prefix: { contains: query } }
            ]
        }
    });
    return professors;
}




export default searchProfessors;