const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  // Read data from JSON files
  const coursesData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'courses.json')));
  const professorsData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'professors.json')));
  const usersData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'users.json')));

  // lucas commit for checking

  // Insert courses
  const insertedCourses = [];
  for (const course of coursesData) {
    const createdCourse = await prisma.course.create({
      data: course,
    });
    insertedCourses.push(createdCourse);
  }
  console.log(`Inserted ${insertedCourses.length} courses`);

  // Insert professors
  const insertedProfessors = [];
  for (const professor of professorsData) {
    const createdProfessor = await prisma.professor.create({
      data: professor,
    });
    insertedProfessors.push(createdProfessor);
  }
  console.log(`Inserted ${insertedProfessors.length} professors`);

  // Insert users
  const insertedUsers = [];
  for (const user of usersData) {
    const createdUser = await prisma.user.create({
      data: user,
    });
    insertedUsers.push(createdUser);
  }
  console.log(`Inserted ${insertedUsers.length} users`);

  // Generate and insert unique course-professor relationships
  const uniqueCourseProfessors = new Set();
  const courseProfessorsData = [];
  for (let i = 0; i < 200; i++) {
    const courseId = insertedCourses[i % insertedCourses.length].id;
    const professorId = insertedProfessors[i % insertedProfessors.length].id;
    const key = `${courseId}-${professorId}`;
    if (!uniqueCourseProfessors.has(key)) {
      uniqueCourseProfessors.add(key);
      courseProfessorsData.push({ courseId, professorId });
    }
  }

  for (const cp of courseProfessorsData) {
    await prisma.courseProfessor.create({
      data: cp,
    });
  }
  console.log(`Inserted ${courseProfessorsData.length} course-professor relationships`);

  // Generate and insert reviews
  const reviewsData = [];
  for (let i = 0; i < 100; i++) {
    const courseId = insertedCourses[i % insertedCourses.length].id;
    const professorId = insertedProfessors[i % insertedProfessors.length].id;
    const userId = insertedUsers[i % insertedUsers.length].id;
    const review = {
      courseId,
      professorId,
      userId,
      overallRating: Math.floor(Math.random() * 5) + 1,
      difficulty: Math.floor(Math.random() * 5) + 1,
      workload: Math.floor(Math.random() * 5) + 1,
      lecture: Math.floor(Math.random() * 5) + 1,
      learning: Math.floor(Math.random() * 5) + 1,
      comment: `Comment for review ${i + 1}`
    };
    reviewsData.push(review);
  }

  for (const review of reviewsData) {
    await prisma.review.create({
      data: review,
    });
  }
  console.log(`Inserted ${reviewsData.length} reviews`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
