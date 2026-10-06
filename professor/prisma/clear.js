const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();


async function main() {

  // check if the database is already empty

  await prisma.review.deleteMany({});
  await prisma.courseProfessor.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.professor.deleteMany({});
  
  await prisma.account.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.verificationToken.deleteMany({});
  await prisma.user.deleteMany({});
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Cleared database");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
