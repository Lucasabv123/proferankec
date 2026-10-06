const fs = require('fs');
const path = require('path');

// Function to delete generated data from JSON files
const deleteGeneratedData = (filename, threshold) => {
  const filePath = path.resolve(__dirname, filename);
  let data = [];

  // Read existing data if the file exists
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath));
  }

  // Filter out entries with id values greater than the threshold
  const filteredData = data.filter(item => item.id <= threshold);

  // Write the filtered data back to the file
  fs.writeFileSync(filePath, JSON.stringify(filteredData, null, 2));
};

// Thresholds for each model (assuming original data has ids <= threshold)
const thresholds = {
  'courses.json': 5,          // Replace with your threshold
  'professors.json': 5,       // Replace with your threshold
  'users.json': 5,            // Replace with your threshold
  'reviews.json': 5,          // Replace with your threshold
  'courseProfessors.json': 5  // Replace with your threshold
};

// Delete generated data from each JSON file
for (const [filename, threshold] of Object.entries(thresholds)) {
  deleteGeneratedData(filename, threshold);
}
