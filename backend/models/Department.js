const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  // Add other relevant fields if needed, e.g., head of department
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
