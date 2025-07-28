const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subjectSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: { // e.g., CS101
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department', // Reference to the Department model
    required: true,
  },
  // Add other relevant fields if needed, e.g., credits, teacher assigned
}, { timestamps: true });

// Ensure unique combination of name and department, or code and department if needed
// subjectSchema.index({ name: 1, department: 1 }, { unique: true });
subjectSchema.index({ code: 1, department: 1 }, { unique: true });


const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
