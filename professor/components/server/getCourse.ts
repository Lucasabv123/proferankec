import prisma from "@/helpers/prisma/prisma"; 


async function getCourseData(courseParam: string) {
    const [name, school, department] = courseParam.split("-");
    const courseData = await prisma.course.findFirst({
      where: {
        name: name,
        Department: department,
        School: school
      },
      include: {
        professors: {
          include: {
            professor: true
          }
        }
      }
    });
  
    return courseData;
  }
export default getCourseData;