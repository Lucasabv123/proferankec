const fs = require('fs');
const path = require('path');

const uniqueNames = [
  "Alpha",
  "Beta",
  "Gamma",
  "Delta",
  "Epsilon",
  "Zeta",
  "Eta",
  "Theta",
  "Iota",
  "Kappa"
];

const schools = [
  "School of Computer Science",
  "School of Engineering",
  "School of Business",
  "School of Arts",
  "School of Medicine"
];

const departments = [
  "Computer Science",
  "Electrical Engineering",
  "Business Administration",
  "Fine Arts",
  "Medical Sciences"
];

// Function to generate large dataset and append to existing data
const generateLargeDataset = (filename, count, customGenerator) => {
  const filePath = path.resolve(__dirname, filename);
  let data = [];

  // Read existing data if the file exists
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath));
  }

  // Generate new data entries
  for (let i = 0; i < count; i++) {
    const entry = customGenerator(data.length + 1 + i);
    data.push(entry);
  }

  // Write the combined data back to the file
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Custom generators for each model
const generateCourse = (id) => ({
  name: `Course ${uniqueNames[id % uniqueNames.length]} ${id}`,
  description: `Description for Course ${id}`,
  School: schools[id % schools.length],
  Department: departments[id % departments.length]
});

const generateProfessor = (id) => ({
  Firstname: `Firstname ${uniqueNames[id % uniqueNames.length]} ${id}`,
  Lastname: `Lastname ${uniqueNames[id % uniqueNames.length]} ${id}`,
  Prefix: id % 2 === 0 ? "Dr." : "Prof.",
  Verified: id % 2 === 0
});

const generateUser = (id) => ({
  name: `User ${uniqueNames[id % uniqueNames.length]} ${id}`,
  email: `user${id}_${Date.now()}@example.com`, // Ensure unique email by appending timestamp
  isAdmin: id % 10 === 0 // Every 10th user is an admin
});

const generateReview = (id, totalCourses, totalProfessors, totalUsers) => ({
  courseId: (id % totalCourses) + 1,
  professorId: (id % totalProfessors) + 1,
  userId: (id % totalUsers) + 1,
  overallRating: Math.floor(Math.random() * 5) + 1,
  difficulty: Math.floor(Math.random() * 5) + 1,
  workload: Math.floor(Math.random() * 5) + 1,
  lecture: Math.floor(Math.random() * 5) + 1,
  learning: Math.floor(Math.random() * 5) + 1,
  comment: `Comment for review ${id}`
});

const generateCourseProfessor = (id, totalCourses, totalProfessors) => ({
  courseId: (id % totalCourses) + 1,
  professorId: (id % totalProfessors) + 1
});

// Generate datasets
const totalCourses = 50;
const totalProfessors = 50;
const totalUsers = 50;
const totalReviews = 100;
const totalCourseProfessors = 200;

generateLargeDataset('courses.json', totalCourses, generateCourse);
generateLargeDataset('professors.json', totalProfessors, generateProfessor);
generateLargeDataset('users.json', totalUsers, generateUser);
generateLargeDataset('reviews.json', totalReviews, (id) => generateReview(id, totalCourses, totalProfessors, totalUsers)); // Generate more reviews for variety
generateLargeDataset('courseProfessors.json', totalCourseProfessors, (id) => generateCourseProfessor(id, totalCourses, totalProfessors)); // Ensure enough course-professor links
