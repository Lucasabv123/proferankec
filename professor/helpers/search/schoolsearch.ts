import prisma from '../prisma/prisma'; 
async function schoolSearch(school: string) {
    console.log(school)
    try {
        const courses = await prisma.course.findMany({
          where: {
            School: {
                contains: school,
            }
          },
          select: {
            School: true,
          },
        });
        console.log(courses);
        return courses;
      } catch (error) {
        console.log('here');
        console.error('Failed to retrieve courses for the school:', error);
        throw error;
      }
}
export default schoolSearch; 

