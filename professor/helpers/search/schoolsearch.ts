import prisma from '../prisma/prisma';
import { searchMode } from '../search/mode'; 
async function schoolSearch(school: string) {
    try {
        const courses = await prisma.course.findMany({
          where: {
            School: {
                contains: school, ...searchMode
            }
          },
          select: {
            School: true,
          },
        });
        return courses;
      } catch (error) {
        console.error('Failed to retrieve courses for the school:', error);
        throw error;
      }
}
export default schoolSearch; 

