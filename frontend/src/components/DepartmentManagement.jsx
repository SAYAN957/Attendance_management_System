import React, { useState, useEffect } from 'react';
import { getDepartments, addDepartment, deleteDepartment } from '../services/api'; // Assuming update is not implemented yet

function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getDepartments();
      setDepartments(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch departments.');
      console.error("Fetch departments error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDepartmentName.trim()) {
      setError('Department name cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');
    try {
      const response = await addDepartment({ name: newDepartmentName });
      setDepartments([...departments, response.data]); // Add new department to the list
      setNewDepartmentName(''); // Clear the input field
      setSuccessMessage(`Department "${response.data.name}" added successfully!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add department.');
      console.error("Add department error:", err);
    } finally {
      setIsLoading(false);
    }
  };

   const handleDeleteDepartment = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the department "${name}"? This might affect related subjects and students.`)) {
        return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');
    try {
        await deleteDepartment(id);
        setDepartments(departments.filter(dept => dept._id !== id)); // Remove from list
        setSuccessMessage(`Department "${name}" deleted successfully!`);
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete department. It might be in use.');
        console.error("Delete department error:", err);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Departments Management</h2>

      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <form onSubmit={handleAddDepartment}>
        <h3>Add New Department</h3>
        <label htmlFor="deptName">Department Name:</label>
        <input
          type="text"
          id="deptName"
          value={newDepartmentName}
          onChange={(e) => setNewDepartmentName(e.target.value)}
          placeholder="Enter department name"
          required
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Department'}
        </button>
      </form>

      <h3>Existing Departments</h3>
      {isLoading && departments.length === 0 && <p>Loading departments...</p>}
      {departments.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept._id}>
                <td>{dept.name}</td>
                <td>{new Date(dept.createdAt).toLocaleDateString()}</td>
                 <td>
                  {/* Add Edit button later */}
                  <button
                    onClick={() => handleDeleteDepartment(dept._id, dept.name)}
                    disabled={isLoading}
                    style={{backgroundColor: '#d9534f', marginLeft: '5px'}} // Basic styling for delete
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !isLoading && <p>No departments found.</p>
      )}
    </div>
  );
}

export default DepartmentManagement;
