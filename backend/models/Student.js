const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  rollNumber: { // Unique identifier for the student within the institution/department
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  // Consider adding email, phone, address, etc.
  // Subjects enrolled could be an array of ObjectIds referencing Subject,
  // but managing attendance might be simpler if linked directly to Attendance records.
  // subjects: [{
  //   type: Schema.Types.ObjectId,
  //   ref: 'Subject'
  // }],
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
