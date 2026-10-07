import prisma from '../prisma/prisma';
import { searchMode } from '../search/mode';

async function schoolSearch(school: string) {
    const q = school.trim();
    return prisma.school.findMany({
        where: {
            OR: [
                { name: { contains: q, ...searchMode } },
                { key: { contains: q, ...searchMode } },
            ],
        },
        select: { id: true, key: true, name: true },
        orderBy: { name: 'asc' },
    });
}
export default schoolSearch;
