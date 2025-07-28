import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css'; // We can keep this for basic styling or replace later
import DepartmentManagement from './components/DepartmentManagement';
import SubjectManagement from './components/SubjectManagement';
import StudentManagement from './components/StudentManagement';
import MarkAttendance from './components/MarkAttendance';
import ViewAttendance from './components/ViewAttendance';
import Dashboard from './components/Dashboard';

// Placeholder components - we will create these later
// const Dashboard = () => <h2>Dashboard</h2>; // Replaced
// const Departments = () => <h2>Departments Management</h2>; // Replaced
// const Subjects = () => <h2>Subjects Management</h2>; // Replaced
// const Students = () => <h2>Students Management</h2>; // Replaced
// const MarkAttendance = () => <h2>Mark Attendance</h2>; // Replaced
// const ViewAttendance = () => <h2>View Attendance Records</h2>; // Replaced
const NotFound = () => <h2>404 - Page Not Found</h2>;


function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <h1>Attendance App</h1>
          <ul>
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/departments">Departments</Link></li>
            <li><Link to="/subjects">Subjects</Link></li>
            <li><Link to="/students">Students</Link></li>
            <li><Link to="/mark-attendance">Mark Attendance</Link></li>
            <li><Link to="/view-attendance">View Attendance</Link></li>
          </ul>
        </nav>

        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/departments" element={<DepartmentManagement />} />
            <Route path="/subjects" element={<SubjectManagement />} />
            <Route path="/students" element={<StudentManagement />} />
            <Route path="/mark-attendance" element={<MarkAttendance />} />
            <Route path="/view-attendance" element={<ViewAttendance />} />
            <Route path="*" element={<NotFound />} /> {/* Catch-all route */}
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} Attendance Management System</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
