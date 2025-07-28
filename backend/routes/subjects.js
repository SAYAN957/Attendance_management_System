const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const Department = require('../models/Department'); // Needed to validate department existence

// GET all subjects (optionally filter by department)
router.get('/', async (req, res) => {
  const { departmentId } = req.query;
  let filter = {};
  if (departmentId) {
    filter.department = departmentId;
  }
  try {
    const subjects = await Subject.find(filter).populate('department', 'name'); // Populate department name
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new subject
router.post('/', async (req, res) => {
  const { name, code, department: departmentId } = req.body;

  // Validate if department exists
  try {
    const departmentExists = await Department.findById(departmentId);
    if (!departmentExists) {
      return res.status(400).json({ message: `Department with ID ${departmentId} not found.` });
    }
  } catch (err) {
     return res.status(500).json({ message: `Error checking department: ${err.message}` });
  }

  const subject = new Subject({
    name: name,
    code: code,
    department: departmentId,
  });

  try {
    const newSubject = await subject.save();
    // Populate department info before sending response
    await newSubject.populate('department', 'name');
    res.status(201).json(newSubject);
  } catch (err) {
    // Handle potential duplicate key error (unique code within department)
    if (err.code === 11000) {
        return res.status(400).json({ message: `Subject code '${code}' already exists for this department.` });
    }
    res.status(400).json({ message: err.message });
  }
});

// GET a specific subject by ID
router.get('/:id', getSubject, (req, res) => {
  res.json(res.subject);
});

// PATCH/PUT update a subject by ID
router.patch('/:id', getSubject, async (req, res) => {
  if (req.body.name != null) {
    res.subject.name = req.body.name;
  }
  if (req.body.code != null) {
    res.subject.code = req.body.code;
  }
  // Allow changing department? Requires validation
  if (req.body.department != null) {
     try {
        const departmentExists = await Department.findById(req.body.department);
        if (!departmentExists) {
          return res.status(400).json({ message: `Department with ID ${req.body.department} not found.` });
        }
        res.subject.department = req.body.department;
      } catch (err) {
         return res.status(500).json({ message: `Error checking department: ${err.message}` });
      }
  }

  try {
    const updatedSubject = await res.subject.save();
    await updatedSubject.populate('department', 'name');
    res.json(updatedSubject);
  } catch (err) {
     if (err.code === 11000) {
        return res.status(400).json({ message: `Subject code '${res.subject.code}' already exists for this department.` });
    }
    res.status(400).json({ message: err.message });
  }
});

// DELETE a subject by ID
router.delete('/:id', getSubject, async (req, res) => {
  try {
    // TODO: Add check: Ensure subject is not used in Attendance records before deleting
    await res.subject.deleteOne();
    res.json({ message: 'Deleted Subject' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware function to get subject object by ID
async function getSubject(req, res, next) {
  let subject;
  try {
    // Populate department name when fetching a single subject
    subject = await Subject.findById(req.params.id).populate('department', 'name');
    if (subject == null) {
      return res.status(404).json({ message: 'Cannot find subject' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.subject = subject;
  next();
}

module.exports = router;
