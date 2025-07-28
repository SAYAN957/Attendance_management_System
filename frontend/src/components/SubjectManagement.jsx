import React, { useState, useEffect } from 'react';
import { getSubjects, addSubject, deleteSubject, getDepartments } from '../services/api';

function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [newSubject, setNewSubject] = useState({ name: '', code: '', department: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [filterDepartment, setFilterDepartment] = useState(''); // For filtering displayed subjects

  // Fetch departments and subjects on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch subjects again when filter changes
   useEffect(() => {
    fetchSubjects();
  }, [filterDepartment]);


  const fetchInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [deptResponse, subjResponse] = await Promise.all([
        getDepartments(),
        getSubjects() // Fetch all initially
      ]);
      setDepartments(deptResponse.data);
      setSubjects(subjResponse.data);
      // Set default department for the form if departments exist
      if (deptResponse.data.length > 0) {
        setNewSubject(prev => ({ ...prev, department: deptResponse.data[0]._id }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch initial data.');
      console.error("Fetch initial data error:", err);
    } finally {
      setIsLoading(false);
    }
  };

   const fetchSubjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getSubjects(filterDepartment || null); // Pass filter ID or null
      setSubjects(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch subjects.');
      console.error("Fetch subjects error:", err);
    } finally {
      setIsLoading(false);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubject(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.name.trim() || !newSubject.code.trim() || !newSubject.department) {
      setError('Please fill in all fields: Name, Code, and Department.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');
    try {
      const response = await addSubject(newSubject);
      // Add to list only if it matches the current filter or if no filter is set
       if (!filterDepartment || filterDepartment === response.data.department._id) {
           setSubjects([...subjects, response.data]);
       }
      setNewSubject({ name: '', code: '', department: departments.length > 0 ? departments[0]._id : '' }); // Reset form
      setSuccessMessage(`Subject "${response.data.name}" added successfully!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add subject.');
      console.error("Add subject error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubject = async (id, name) => {
     if (!window.confirm(`Are you sure you want to delete the subject "${name}"? This might affect related attendance records.`)) {
        return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');
    try {
        await deleteSubject(id);
        setSubjects(subjects.filter(subj => subj._id !== id)); // Remove from list
        setSuccessMessage(`Subject "${name}" deleted successfully!`);
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete subject. It might be in use.');
        console.error("Delete subject error:", err);
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div>
      <h2>Subjects Management</h2>

      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <form onSubmit={handleAddSubject}>
        <h3>Add New Subject</h3>
        <label htmlFor="subjectName">Subject Name:</label>
        <input
          type="text"
          id="subjectName"
          name="name"
          value={newSubject.name}
          onChange={handleInputChange}
          placeholder="Enter subject name"
          required
          disabled={isLoading}
        />

        <label htmlFor="subjectCode">Subject Code:</label>
        <input
          type="text"
          id="subjectCode"
          name="code"
          value={newSubject.code}
          onChange={handleInputChange}
          placeholder="Enter subject code (e.g., CS101)"
          required
          disabled={isLoading}
        />

        <label htmlFor="subjectDepartment">Department:</label>
        <select
          id="subjectDepartment"
          name="department"
          value={newSubject.department}
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
          {isLoading ? 'Adding...' : 'Add Subject'}
        </button>
         {departments.length === 0 && <p style={{color: 'orange', marginTop: '0.5rem'}}>Please add a department first.</p>}
      </form>

      <h3>Existing Subjects</h3>
       <div>
           <label htmlFor="filterDepartment">Filter by Department: </label>
           <select
             id="filterDepartment"
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

      {isLoading && subjects.length === 0 && <p>Loading subjects...</p>}
      {subjects.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subj) => (
              <tr key={subj._id}>
                <td>{subj.name}</td>
                <td>{subj.code}</td>
                <td>{subj.department?.name || 'N/A'}</td> {/* Handle potential missing populated data */}
                 <td>
                  {/* Add Edit button later */}
                  <button
                    onClick={() => handleDeleteSubject(subj._id, subj.name)}
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
        !isLoading && <p>No subjects found{filterDepartment ? ' for the selected department' : ''}.</p>
      )}
    </div>
  );
}

export default SubjectManagement;
