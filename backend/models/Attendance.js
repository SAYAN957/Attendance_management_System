const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  subject: {
    type: Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  department: { // Denormalized for easier querying/filtering, but ensure consistency
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    // Consider setting default to Date.now or handling date part only
  },
  status: {
    type: String,
    required: true,
    enum: ['Present', 'Absent'], // Define possible statuses
    default: 'Absent',
  },
  markedBy: { // Optional: Track which teacher/admin marked the attendance
    type: Schema.Types.ObjectId,
    // ref: 'Teacher' // Assuming a Teacher model exists or will be added
  }
}, { timestamps: true });

// Indexes for efficient querying
attendanceSchema.index({ date: 1, subject: 1 }); // Find attendance for a subject on a date
attendanceSchema.index({ student: 1, subject: 1 }); // Find attendance for a student in a subject
attendanceSchema.index({ date: 1, department: 1, subject: 1 }); // Find attendance for a subject in a dept on a date

// Ensure a student's attendance is recorded only once per subject per day
attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
