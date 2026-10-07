import prisma from '../prisma/prisma';
import { matchingIdsFilter } from './text';

async function schoolSearch(school: string) {
    return prisma.school.findMany({
        where: await matchingIdsFilter('School', school),
        select: { id: true, key: true, name: true },
        orderBy: { name: 'asc' },
    });
}
export default schoolSearch;
