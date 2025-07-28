import React, { useState, useEffect } from 'react';
import { getDepartments, getSubjects, getAttendance } from '../services/api';

function ViewAttendance() {
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filters, setFilters] = useState({
    departmentId: '',
    subjectId: '',
    date: new Date().toISOString().split('T')[0], // Default to today
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingRecords, setIsFetchingRecords] = useState(false);
  const [error, setError] = useState(null);

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Fetch subjects when department filter changes
  useEffect(() => {
    if (filters.departmentId) {
      fetchSubjectsForDepartment(filters.departmentId);
    } else {
      setSubjects([]); // Clear subjects if no department selected
      setFilters(prev => ({ ...prev, subjectId: '' })); // Clear subject filter
    }
  }, [filters.departmentId]);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const response = await getDepartments();
      setDepartments(response.data);
    } catch (err) {
      setError('Failed to fetch departments.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubjectsForDepartment = async (departmentId) => {
    setIsLoading(true); // Use main loading indicator for dependent data
    try {
      const response = await getSubjects(departmentId);
      setSubjects(response.data);
      // Don't clear subject filter here automatically, let user choose
    } catch (err) {
      setError('Failed to fetch subjects for the selected department.');
      setSubjects([]);
      setFilters(prev => ({ ...prev, subjectId: '' })); // Clear subject if fetch fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFetchAttendance = async (e) => {
    e.preventDefault(); // Prevent form submission if wrapped in form
    if (!filters.date) {
        setError("Please select a date.");
        return;
    }
    // Department and Subject are optional filters for the API, but might be required by UI logic if desired

    setIsFetchingRecords(true);
    setError(null);
    setAttendanceRecords([]); // Clear previous results

    // Prepare filters for API call (remove empty strings)
    const apiFilters = {};
    if (filters.departmentId) apiFilters.departmentId = filters.departmentId;
    if (filters.subjectId) apiFilters.subjectId = filters.subjectId;
    if (filters.date) apiFilters.date = filters.date;


    try {
      const response = await getAttendance(apiFilters);
      setAttendanceRecords(response.data);
       if (response.data.length === 0) {
           setError("No attendance records found for the selected criteria.");
       }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attendance records.');
      console.error("Fetch attendance error:", err);
    } finally {
      setIsFetchingRecords(false);
    }
  };

  return (
    <div>
      <h2>View Attendance Records</h2>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleFetchAttendance} className="filter-form" style={{ marginBottom: '1.5rem', padding: '1rem', background: '#eee', borderRadius: '5px' }}>
         <h3>Filter Records</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label htmlFor="filterDept">Department:</label>
            <select
              id="filterDept"
              name="departmentId"
              value={filters.departmentId}
              onChange={handleFilterChange}
              disabled={isLoading}
            >
              <option value="">-- All Departments --</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filterSubj">Subject:</label>
            <select
              id="filterSubj"
              name="subjectId"
              value={filters.subjectId}
              onChange={handleFilterChange}
              disabled={isLoading || !filters.departmentId || subjects.length === 0}
            >
              <option value="">-- All Subjects --</option>
              {subjects.map(subj => (
                <option key={subj._id} value={subj._id}>{subj.name} ({subj.code})</option>
              ))}
            </select>
             {!filters.departmentId && <small> (Select Department first)</small>}
          </div>

          <div>
            <label htmlFor="filterDate">Date:</label>
            <input
              type="date"
              id="filterDate"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              required // Date is usually required for viewing attendance
              disabled={isLoading}
            />
          </div>
           <div>
               <button type="submit" disabled={isFetchingRecords || isLoading}>
                 {isFetchingRecords ? 'Fetching...' : 'Fetch Records'}
               </button>
           </div>
        </div>
      </form>

      {isFetchingRecords && <p>Loading attendance records...</p>}

      {attendanceRecords.length > 0 && !isFetchingRecords && (
        <>
          <h3>Attendance Results</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Subject</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map(record => (
                <tr key={record._id}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{record.student?.name || 'N/A'}</td>
                  <td>{record.student?.rollNumber || 'N/A'}</td>
                  <td>{record.subject?.name || 'N/A'} ({record.subject?.code || ''})</td>
                  <td>{record.department?.name || 'N/A'}</td>
                  <td style={{ color: record.status === 'Present' ? 'green' : 'red', fontWeight: 'bold' }}>
                    {record.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default ViewAttendance;
