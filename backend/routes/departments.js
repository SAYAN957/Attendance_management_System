const express = require('express');
const router = express.Router();
const Department = require('../models/Department'); // Import the Department model

// GET all departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new department
router.post('/', async (req, res) => {
  const department = new Department({
    name: req.body.name,
  });

  try {
    const newDepartment = await department.save();
    res.status(201).json(newDepartment);
  } catch (err) {
    // Handle potential duplicate key error (unique name)
    if (err.code === 11000) {
        return res.status(400).json({ message: `Department name '${req.body.name}' already exists.` });
    }
    res.status(400).json({ message: err.message });
  }
});

// GET a specific department by ID
router.get('/:id', getDepartment, (req, res) => {
  res.json(res.department);
});

// PATCH/PUT update a department by ID
router.patch('/:id', getDepartment, async (req, res) => {
  if (req.body.name != null) {
    res.department.name = req.body.name;
  }
  try {
    const updatedDepartment = await res.department.save();
    res.json(updatedDepartment);
  } catch (err) {
     if (err.code === 11000) {
        return res.status(400).json({ message: `Department name '${req.body.name}' already exists.` });
    }
    res.status(400).json({ message: err.message });
  }
});

// DELETE a department by ID
router.delete('/:id', getDepartment, async (req, res) => {
  try {
    // TODO: Add check: Ensure department is not used by Subjects or Students before deleting
    await res.department.deleteOne(); // Use deleteOne instead of remove
    res.json({ message: 'Deleted Department' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware function to get department object by ID
async function getDepartment(req, res, next) {
  let department;
  try {
    department = await Department.findById(req.params.id);
    if (department == null) {
      return res.status(404).json({ message: 'Cannot find department' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.department = department;
  next(); // Proceed to the next middleware/route handler
}

module.exports = router;
