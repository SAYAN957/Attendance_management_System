import React, { useState, useEffect } from 'react';
import { getStudents, addStudent, deleteStudent, getDepartments } from '../services/api';

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [newStudent, setNewStudent] = useState({ name: '', rollNumber: '', department: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [filterDepartment, setFilterDepartment] = useState(''); // For filtering displayed students

  // Fetch departments and students on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch students again when filter changes
  useEffect(() => {
    fetchStudents();
  }, [filterDepartment]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [deptResponse, studentResponse] = await Promise.all([
        getDepartments(),
        getStudents() // Fetch all initially
      ]);
      setDepartments(deptResponse.data);
      setStudents(studentResponse.data);
      // Set default department for the form if departments exist
      if (deptResponse.data.length > 0) {
        setNewStudent(prev => ({ ...prev, department: deptResponse.data[0]._id }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch initial data.');
      console.error("Fetch initial data error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getStudents(filterDepartment || null); // Pass filter ID or null
      setStudents(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch students.');
      console.error("Fetch students error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.name.trim() || !newStudent.rollNumber.trim() || !newStudent.department) {
      setError('Please fill in all fields: Name, Roll Number, and Department.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');
    try {
      const response = await addStudent(newStudent);
       // Add to list only if it matches the current filter or if no filter is set
       if (!filterDepartment || filterDepartment === response.data.department._id) {
           setStudents([...students, response.data]);
       }
      setNewStudent({ name: '', rollNumber: '', department: departments.length > 0 ? departments[0]._id : '' }); // Reset form
      setSuccessMessage(`Student "${response.data.name}" added successfully!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student.');
      console.error("Add student error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStudent = async (id, name) => {
     if (!window.confirm(`Are you sure you want to delete the student "${name}"? This might affect related attendance records.`)) {
        return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');
    try {
        await deleteStudent(id);
        setStudents(students.filter(stud => stud._id !== id)); // Remove from list
        setSuccessMessage(`Student "${name}" deleted successfully!`);
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete student. It might be in use.');
        console.error("Delete student error:", err);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Students Management</h2>

      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <form onSubmit={handleAddStudent}>
        <h3>Add New Student</h3>
        <label htmlFor="studentName">Student Name:</label>
        <input
          type="text"
          id="studentName"
          name="name"
          value={newStudent.name}
          onChange={handleInputChange}
          placeholder="Enter student name"
          required
          disabled={isLoading}
        />

        <label htmlFor="studentRollNumber">Roll Number:</label>
        <input
          type="text"
          id="studentRollNumber"
          name="rollNumber"
          value={newStudent.rollNumber}
          onChange={handleInputChange}
          placeholder="Enter unique roll number"
          required
          disabled={isLoading}
        />

        <label htmlFor="studentDepartment">Department:</label>
        <select
          id="studentDepartment"
          name="department"
          value={newStudent.department}
          onChange={handleInputChange}
          required
          disabled={isLoading || departments.length === 0}
        >
          <option value="" disabled>-- Select Department --</option>
          {departments.map(dept => (
            <option key={dept._id} value={dept._id}>{dept.name}</option>
          ))}
        </select>

        <button type="submit" disabled={isLoading || departments.length === 0}>
          {isLoading ? 'Adding...' : 'Add Student'}
        </button>
        {departments.length === 0 && <p style={{color: 'orange', marginTop: '0.5rem'}}>Please add a department first.</p>}
      </form>

      <h3>Existing Students</h3>
       <div>
           <label htmlFor="filterStudentDepartment">Filter by Department: </label>
           <select
             id="filterStudentDepartment"
             value={filterDepartment}
             onChange={(e) => setFilterDepartment(e.target.value)}
             disabled={isLoading}
           >
             <option value="">-- All Departments --</option>
             {departments.map(dept => (
               <option key={dept._id} value={dept._id}>{dept.name}</option>
             ))}
           </select>
       </div>

      {isLoading && students.length === 0 && <p>Loading students...</p>}
      {students.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll Number</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((stud) => (
              <tr key={stud._id}>
                <td>{stud.name}</td>
                <td>{stud.rollNumber}</td>
                <td>{stud.department?.name || 'N/A'}</td>
                 <td>
                  {/* Add Edit button later */}
                  <button
                    onClick={() => handleDeleteStudent(stud._id, stud.name)}
                    disabled={isLoading}
                    style={{backgroundColor: '#d9534f', marginLeft: '5px'}}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !isLoading && <p>No students found{filterDepartment ? ' for the selected department' : ''}.</p>
      )}
    </div>
  );
}

export default StudentManagement;
