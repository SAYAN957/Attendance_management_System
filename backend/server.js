require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000; // Use port from env or default to 5000

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies

// Basic route
app.get('/', (req, res) => {
  res.send('Attendance Management API is running!');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the server only after successful DB connection
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1); // Exit process with failure
  });

// Import API routes
const departmentRoutes = require('./routes/departments');
const subjectRoutes = require('./routes/subjects');
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');

// Use API routes
app.use('/api/departments', departmentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the server only after successful DB connection
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1); // Exit process with failure
  });


// TODO: Define Mongoose Schemas (Student, Subject, Attendance, Department, Teacher?) -> Done (Basic)
// TODO: Implement API routes (CRUD for Students, Subjects, Attendance, etc.) -> Done (Basic CRUD)
// TODO: Add Authentication/Authorization (e.g., for teachers)
// TODO: Add more robust error handling
// TODO: Add input validation (e.g., using Joi or express-validator)
