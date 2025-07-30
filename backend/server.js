require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Attendance Management API is running!');
});

// Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('Connected to MongoDB');
//     app.listen(PORT, () => {
//       console.log(`Server listening on port ${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error('Error connecting to MongoDB:', err.message);
//     process.exit(1);
//   });
const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;

mongoose.connect(mongoURI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  });

// API routes
const departmentRoutes = require('./routes/departments');
const subjectRoutes = require('./routes/subjects');
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');

app.use('/api/departments', departmentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
