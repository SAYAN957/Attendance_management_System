import React, { useState, useEffect } from 'react';
import { getDepartments, getSubjects, getStudentsForMarking, markAttendance } from '../services/api';

function MarkAttendance() {
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [attendanceStatus, setAttendanceStatus] = useState({}); // { studentId: 'Present'/'Absent', ... }
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Fetch subjects when department changes
  useEffect(() => {
    if (selectedDepartment) {
      fetchSubjectsForDepartment(selectedDepartment);
    } else {
      setSubjects([]); // Clear subjects if no department selected
      setStudents([]); // Clear students
      setSelectedSubject(''); // Clear subject selection
    }
  }, [selectedDepartment]);

  // Fetch students when subject changes (and department is selected)
  useEffect(() => {
    if (selectedDepartment && selectedSubject) {
        // Using getStudentsForMarking which filters by department
        // Alternatively, could filter students fetched earlier if enrollment logic was different
        fetchStudentsForDepartment(selectedDepartment);
    } else {
        setStudents([]); // Clear students if no subject/department selected
    }
    // Reset attendance status when selection changes
    setAttendanceStatus({});
  }, [selectedDepartment, selectedSubject]); // Re-fetch students if subject changes


  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const response = await getDepartments();
      setDepartments(response.data);
      // Optionally select the first department by default
      // if (response.data.length > 0) setSelectedDepartment(response.data[0]._id);
    } catch (err) {
      setError('Failed to fetch departments.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubjectsForDepartment = async (departmentId) => {
    setIsLoading(true);
    try {
      const response = await getSubjects(departmentId);
      setSubjects(response.data);
      setSelectedSubject(''); // Reset subject selection when department changes
      setStudents([]); // Clear students when department changes
    } catch (err) {
      setError('Failed to fetch subjects for the selected department.');
      setSubjects([]);
    } finally {
      setIsLoading(false);
    }
  };

   const fetchStudentsForDepartment = async (departmentId) => {
    setIsLoading(true);
    try {
      // Using the dedicated endpoint, assuming students are primarily grouped by department
      const response = await getStudentsForMarking(departmentId);
      setStudents(response.data);
      // Initialize attendance status for fetched students (default to Absent or Present?)
      const initialStatus = {};
      response.data.forEach(student => {
          initialStatus[student._id] = 'Absent'; // Default to Absent
      });
      setAttendanceStatus(initialStatus);

    } catch (err) {
      setError('Failed to fetch students for the selected department.');
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleStatusChange = (studentId, status) => {
    setAttendanceStatus(prev => ({ ...prev, [studentId]: status }));
  };

   const handleMarkAll = (status) => {
        const newStatus = {};
        students.forEach(student => {
            newStatus[student._id] = status;
        });
        setAttendanceStatus(newStatus);
    };


  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    if (!selectedDepartment || !selectedSubject || !selectedDate || students.length === 0) {
      setError('Please select Department, Subject, Date, and ensure students are loaded.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage('');

    const attendanceData = students.map(student => ({
      studentId: student._id,
      status: attendanceStatus[student._id] || 'Absent', // Default if somehow missing
    }));

    const payload = {
      date: selectedDate,
      subjectId: selectedSubject,
      departmentId: selectedDepartment,
      attendanceData: attendanceData,
    };

    try {
      const response = await markAttendance(payload);
      setSuccessMessage(response.data.message || 'Attendance submitted successfully!');
      // Optionally clear the form or students list after submission
      // setStudents([]);
      // setSelectedSubject('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit attendance.');
      console.error("Submit attendance error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Mark Attendance</h2>

      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <form onSubmit={handleSubmitAttendance}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div>
            <label htmlFor="markDept">Department:</label>
            <select
              id="markDept"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              required
              disabled={isLoading || isSubmitting}
            >
              <option value="">-- Select Department --</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="markSubj">Subject:</label>
            <select
              id="markSubj"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              required
              disabled={isLoading || isSubmitting || !selectedDepartment || subjects.length === 0}
            >
              <option value="">-- Select Subject --</option>
              {subjects.map(subj => (
                <option key={subj._id} value={subj._id}>{subj.name} ({subj.code})</option>
              ))}
            </select>
             {!selectedDepartment && <small> (Select Department first)</small>}
             {selectedDepartment && subjects.length === 0 && !isLoading && <small style={{color: 'orange'}}> (No subjects found for this department)</small>}
          </div>

          <div>
            <label htmlFor="markDate">Date:</label>
            <input
              type="date"
              id="markDate"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              disabled={isLoading || isSubmitting}
            />
          </div>
        </div>

        {isLoading && <p>Loading data...</p>}

        {students.length > 0 && !isLoading && (
          <>
            <h3>Student List</h3>
             <div style={{ marginBottom: '1rem' }}>
                <button type="button" onClick={() => handleMarkAll('Present')} disabled={isSubmitting} style={{ marginRight: '10px', backgroundColor: '#5bc0de', color: 'white' }}>Mark All Present</button>
                <button type="button" onClick={() => handleMarkAll('Absent')} disabled={isSubmitting} style={{ backgroundColor: '#f0ad4e', color: 'white' }}>Mark All Absent</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student._id}>
                    <td>{student.rollNumber}</td>
                    <td>{student.name}</td>
                    <td>
                      <select
                        value={attendanceStatus[student._id] || 'Absent'}
                        onChange={(e) => handleStatusChange(student._id, e.target.value)}
                        disabled={isSubmitting}
                        style={{ backgroundColor: attendanceStatus[student._id] === 'Present' ? '#dff0d8' : '#f2dede' }}
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="submit" disabled={isSubmitting || isLoading} style={{ marginTop: '1rem' }}>
              {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
            </button>
          </>
        )}
         {!isLoading && selectedDepartment && selectedSubject && students.length === 0 && <p>No students found for the selected department.</p>}
         {!selectedDepartment || !selectedSubject && <p>Please select a department and subject to load students.</p>}

      </form>
    </div>
  );
}

export default MarkAttendance;
