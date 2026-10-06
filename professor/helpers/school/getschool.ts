import prisma from '../prisma/prisma';

// schools are linked by key ("/schools/usfq"); old links used the full name
async function getSchool(param: string) {
    const value = decodeURIComponent(param);
    return (
        (await prisma.school.findUnique({ where: { key: value.toLowerCase() } })) ??
        (await prisma.school.findFirst({ where: { name: value } }))
    );
}

export default getSchool;
