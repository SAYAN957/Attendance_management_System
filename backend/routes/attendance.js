const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const mongoose = require('mongoose');

// GET attendance records (filter by date, subject, department, student)
router.get('/', async (req, res) => {
  const { date, subjectId, departmentId, studentId } = req.query;
  let filter = {};

  if (date) {
    // Ensure date is handled correctly (e.g., match the start of the day)
    try {
        const targetDate = new Date(date);
        const nextDay = new Date(date);
        nextDay.setDate(targetDate.getDate() + 1);
        filter.date = { $gte: targetDate, $lt: nextDay };
    } catch (e) {
        return res.status(400).json({ message: 'Invalid date format provided for filtering.' });
    }
  }
  if (subjectId) filter.subject = subjectId;
  if (departmentId) filter.department = departmentId;
  if (studentId) filter.student = studentId;

  try {
    const attendanceRecords = await Attendance.find(filter)
      .populate('student', 'name rollNumber') // Populate student details
      .populate('subject', 'name code')     // Populate subject details
      .populate('department', 'name');   // Populate department details
    res.json(attendanceRecords);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Mark attendance for multiple students for a specific subject and date
// Expects body: { date: "YYYY-MM-DD", subjectId: "...", departmentId: "...", attendanceData: [{ studentId: "...", status: "Present/Absent" }, ...] }
router.post('/mark', async (req, res) => {
  const { date, subjectId, departmentId, attendanceData } = req.body;

  if (!date || !subjectId || !departmentId || !Array.isArray(attendanceData)) {
    return res.status(400).json({ message: 'Missing required fields: date, subjectId, departmentId, attendanceData array.' });
  }

  // Validate date format
   let attendanceDate;
   try {
       attendanceDate = new Date(date);
       if (isNaN(attendanceDate.getTime())) {
           throw new Error('Invalid Date');
       }
       // Optional: Set to midnight UTC or local time for consistency
       attendanceDate.setUTCHours(0, 0, 0, 0);
   } catch (e) {
       return res.status(400).json({ message: 'Invalid date format. Please use YYYY-MM-DD.' });
   }


  const operations = attendanceData.map(record => {
    if (!record.studentId || !record.status || !['Present', 'Absent'].includes(record.status)) {
        // Skip invalid records or throw an error
        console.warn(`Skipping invalid attendance record: ${JSON.stringify(record)}`);
        return null; // Or handle error appropriately
    }
    return {
      updateOne: {
        filter: {
          student: record.studentId,
          subject: subjectId,
          date: attendanceDate // Use the validated and standardized date
        },
        update: {
          $set: {
            student: record.studentId,
            subject: subjectId,
            department: departmentId, // Assuming all students in the list belong to this dept for this subject
            date: attendanceDate,
            status: record.status,
            // markedBy: req.user.id // If authentication is implemented
          }
        },
        upsert: true // Create a new document if one doesn't exist
      }
    };
  }).filter(op => op !== null); // Remove any null operations from invalid records

  if (operations.length === 0 && attendanceData.length > 0) {
      return res.status(400).json({ message: 'No valid attendance data provided.' });
  }
  if (operations.length === 0) {
       return res.status(200).json({ message: 'No attendance data to process.' });
  }


  try {
    const result = await Attendance.bulkWrite(operations);
    res.status(201).json({
        message: 'Attendance marked successfully.',
        insertedCount: result.insertedCount,
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount
    });
  } catch (err) {
     console.error("Error marking attendance:", err);
     // Check for specific errors if needed (e.g., validation errors)
     res.status(500).json({ message: `Error marking attendance: ${err.message}` });
  }
});


// GET students for a specific subject/department to display for marking attendance
// This might be better placed in students or subjects routes depending on flow
router.get('/students-for-marking', async (req, res) => {
    const { subjectId, departmentId } = req.query;

    if (!subjectId && !departmentId) {
        return res.status(400).json({ message: 'Either subjectId or departmentId is required.' });
    }

    let filter = {};
    if (departmentId) {
        filter.department = departmentId;
    }
    // If subjectId is provided, we might need to find the department associated with the subject first
    // Or assume the frontend provides both, or that students are filtered by department primarily.
    // For simplicity, let's assume filtering by department is the primary way.
    // If subject enrollment is complex, a different approach is needed.

    try {
        // Find students belonging to the specified department
        const students = await Student.find(filter).select('name rollNumber _id'); // Select only needed fields
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// --- Aggregation Routes for Dashboard ---

// GET Overall Attendance Stats (Present vs Absent)
router.get('/stats/overall', async (req, res) => {
    try {
        const overallStats = await Attendance.aggregate([
            {
                $group: {
                    _id: '$status', // Group by status (Present/Absent)
                    count: { $sum: 1 } // Count documents in each group
                }
            },
            {
                $project: {
                    _id: 0, // Exclude the default _id field
                    status: '$_id', // Rename _id to status
                    count: 1 // Include the count
                }
            }
        ]);

        // Format the result for easier consumption by charts
        const formattedStats = { Present: 0, Absent: 0 };
        overallStats.forEach(stat => {
            if (stat.status === 'Present' || stat.status === 'Absent') {
                formattedStats[stat.status] = stat.count;
            }
        });

        res.json(formattedStats);

    } catch (err) {
        console.error("Error fetching overall attendance stats:", err);
        res.status(500).json({ message: `Error fetching overall stats: ${err.message}` });
    }
});

// GET Attendance Stats by Department
router.get('/stats/by-department', async (req, res) => {
    try {
        const statsByDept = await Attendance.aggregate([
            {
                $group: {
                    _id: { department: '$department', status: '$status' }, // Group by department AND status
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: { // Join with departments collection to get department names
                    from: 'departments', // The name of the departments collection
                    localField: '_id.department',
                    foreignField: '_id',
                    as: 'departmentInfo'
                }
            },
            {
                $unwind: '$departmentInfo' // Deconstruct the departmentInfo array
            },
            {
                $group: { // Group again by department to structure the data
                    _id: '$_id.department',
                    departmentName: { $first: '$departmentInfo.name' }, // Get the department name
                    statuses: { // Create an array of status counts for each department
                        $push: {
                            status: '$_id.status',
                            count: '$count'
                        }
                    }
                }
            },
             {
                $project: { // Final projection for cleaner output
                    _id: 0,
                    departmentId: '$_id',
                    departmentName: 1,
                    presentCount: { // Calculate present count
                        $reduce: {
                            input: '$statuses',
                            initialValue: 0,
                            in: { $cond: [{ $eq: ['$$this.status', 'Present'] }, { $add: ['$$value', '$$this.count'] }, '$$value'] }
                        }
                    },
                    absentCount: { // Calculate absent count
                         $reduce: {
                            input: '$statuses',
                            initialValue: 0,
                            in: { $cond: [{ $eq: ['$$this.status', 'Absent'] }, { $add: ['$$value', '$$this.count'] }, '$$value'] }
                        }
                    }
                }
            },
            { $sort: { departmentName: 1 } } // Sort by department name
        ]);

        res.json(statsByDept);

    } catch (err) {
        console.error("Error fetching attendance stats by department:", err);
        res.status(500).json({ message: `Error fetching stats by department: ${err.message}` });
    }
});

// GET Attendance Stats by Subject (within a specific department, optional)
router.get('/stats/by-subject', async (req, res) => {
    const { departmentId } = req.query; // Optional filter by department
    let matchStage = {};
    if (departmentId) {
        // Need to convert string ID to ObjectId for matching
        try {
            matchStage = { department: new mongoose.Types.ObjectId(departmentId) };
        } catch (e) {
            return res.status(400).json({ message: 'Invalid departmentId format.' });
        }
    }

    try {
        const statsBySubject = await Attendance.aggregate([
            { $match: matchStage }, // Apply department filter if provided
            {
                $group: {
                    _id: { subject: '$subject', status: '$status' }, // Group by subject AND status
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: { // Join with subjects collection
                    from: 'subjects',
                    localField: '_id.subject',
                    foreignField: '_id',
                    as: 'subjectInfo'
                }
            },
            {
                $unwind: '$subjectInfo'
            },
             { // Optional: Join with departments if needed, though subjectInfo might already have it
                $lookup: {
                    from: 'departments',
                    localField: 'subjectInfo.department', // Assuming subject schema has department ref
                    foreignField: '_id',
                    as: 'departmentInfo'
                }
            },
            {
                $unwind: { path: '$departmentInfo', preserveNullAndEmptyArrays: true } // Keep subjects even if dept lookup fails
            },
            {
                $group: { // Group again by subject
                    _id: '$_id.subject',
                    subjectName: { $first: '$subjectInfo.name' },
                    subjectCode: { $first: '$subjectInfo.code' },
                    departmentName: { $first: '$departmentInfo.name' }, // Add department name
                    statuses: {
                        $push: {
                            status: '$_id.status',
                            count: '$count'
                        }
                    }
                }
            },
            {
                $project: { // Final projection
                    _id: 0,
                    subjectId: '$_id',
                    subjectName: 1,
                    subjectCode: 1,
                    departmentName: 1, // Include department name
                    presentCount: {
                        $reduce: {
                            input: '$statuses', initialValue: 0,
                            in: { $cond: [{ $eq: ['$$this.status', 'Present'] }, { $add: ['$$value', '$$this.count'] }, '$$value'] }
                        }
                    },
                    absentCount: {
                         $reduce: {
                            input: '$statuses', initialValue: 0,
                            in: { $cond: [{ $eq: ['$$this.status', 'Absent'] }, { $add: ['$$value', '$$this.count'] }, '$$value'] }
                        }
                    }
                }
            },
            { $sort: { departmentName: 1, subjectName: 1 } } // Sort
        ]);

        res.json(statsBySubject);

    } catch (err) {
        console.error("Error fetching attendance stats by subject:", err);
        res.status(500).json({ message: `Error fetching stats by subject: ${err.message}` });
    }
});


// TODO: Add routes for updating/deleting individual attendance records if needed.

module.exports = router;
