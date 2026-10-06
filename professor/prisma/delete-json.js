const fs = require('fs');
const path = require('path');

// Function to delete all data from a JSON file
const deleteAllData = (filename) => {
  const filePath = path.resolve(__dirname, filename);

  // Write an empty array to the file to clear its contents
  fs.writeFileSync(filePath, JSON.stringify([], null, 2));
};

// List of JSON files to clear
const files = [
  'courses.json',
  'professors.json',
  'users.json',
  'reviews.json',
  'courseProfessors.json'
];

// Delete all data from each JSON file
files.forEach(deleteAllData);
