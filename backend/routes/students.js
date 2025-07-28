const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Department = require('../models/Department'); // Needed for validation

// GET all students (optionally filter by department)
router.get('/', async (req, res) => {
  const { departmentId } = req.query;
  let filter = {};
  if (departmentId) {
    filter.department = departmentId;
  }
  try {
    const students = await Student.find(filter).populate('department', 'name'); // Populate department name
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new student
router.post('/', async (req, res) => {
  const { name, rollNumber, department: departmentId } = req.body;

  // Validate if department exists
  try {
    const departmentExists = await Department.findById(departmentId);
    if (!departmentExists) {
      return res.status(400).json({ message: `Department with ID ${departmentId} not found.` });
    }
  } catch (err) {
     return res.status(500).json({ message: `Error checking department: ${err.message}` });
  }

  const student = new Student({
    name: name,
    rollNumber: rollNumber,
    department: departmentId,
  });

  try {
    const newStudent = await student.save();
    await newStudent.populate('department', 'name');
    res.status(201).json(newStudent);
  } catch (err) {
    // Handle potential duplicate key error (unique rollNumber)
    if (err.code === 11000) {
        // Check which field caused the duplicate error if multiple unique fields exist
        if (err.keyPattern && err.keyPattern.rollNumber) {
             return res.status(400).json({ message: `Student roll number '${rollNumber}' already exists.` });
        }
        // Add checks for other unique fields if necessary
    }
    res.status(400).json({ message: err.message });
  }
});

// GET a specific student by ID
router.get('/:id', getStudent, (req, res) => {
  res.json(res.student);
});

// PATCH/PUT update a student by ID
router.patch('/:id', getStudent, async (req, res) => {
  if (req.body.name != null) {
    res.student.name = req.body.name;
  }
  if (req.body.rollNumber != null) {
    res.student.rollNumber = req.body.rollNumber;
  }
  if (req.body.department != null) {
     try {
        const departmentExists = await Department.findById(req.body.department);
        if (!departmentExists) {
          return res.status(400).json({ message: `Department with ID ${req.body.department} not found.` });
        }
        res.student.department = req.body.department;
      } catch (err) {
         return res.status(500).json({ message: `Error checking department: ${err.message}` });
      }
  }

  try {
    const updatedStudent = await res.student.save();
    await updatedStudent.populate('department', 'name');
    res.json(updatedStudent);
  } catch (err) {
     if (err.code === 11000) {
        if (err.keyPattern && err.keyPattern.rollNumber) {
             return res.status(400).json({ message: `Student roll number '${res.student.rollNumber}' already exists.` });
        }
    }
    res.status(400).json({ message: err.message });
  }
});

// DELETE a student by ID
router.delete('/:id', getStudent, async (req, res) => {
  try {
    // TODO: Add check: Ensure student is not used in Attendance records before deleting
    await res.student.deleteOne();
    res.json({ message: 'Deleted Student' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware function to get student object by ID
async function getStudent(req, res, next) {
  let student;
  try {
    student = await Student.findById(req.params.id).populate('department', 'name');
    if (student == null) {
      return res.status(404).json({ message: 'Cannot find student' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.student = student;
  next();
}

module.exports = router;
