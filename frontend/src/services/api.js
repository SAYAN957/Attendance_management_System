import axios from 'axios';

// Determine the base URL for the API
// Use environment variable if available, otherwise default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Add other headers like Authorization if needed later
    // 'Authorization': `Bearer ${token}`
  },
});

// Optional: Add interceptors for request or response handling
// apiClient.interceptors.request.use(config => {
//   // Modify config before request is sent (e.g., add token)
//   return config;
// }, error => {
//   return Promise.reject(error);
// });

// apiClient.interceptors.response.use(response => {
//   // Any status code that lie within the range of 2xx cause this function to trigger
//   return response;
// }, error => {
//   // Any status codes that falls outside the range of 2xx cause this function to trigger
//   // Handle errors globally (e.g., redirect on 401)
//   console.error('API Error:', error.response || error.message);
//   return Promise.reject(error);
// });

export default apiClient;

// Example specific service functions (can be organized into separate files)

// Department Service
export const getDepartments = () => apiClient.get('/departments');
export const addDepartment = (departmentData) => apiClient.post('/departments', departmentData);
export const updateDepartment = (id, departmentData) => apiClient.patch(`/departments/${id}`, departmentData);
export const deleteDepartment = (id) => apiClient.delete(`/departments/${id}`);

// Subject Service
export const getSubjects = (departmentId = null) => {
    const params = departmentId ? { departmentId } : {};
    return apiClient.get('/subjects', { params });
};
export const addSubject = (subjectData) => apiClient.post('/subjects', subjectData);
export const updateSubject = (id, subjectData) => apiClient.patch(`/subjects/${id}`, subjectData);
export const deleteSubject = (id) => apiClient.delete(`/subjects/${id}`);

// Student Service
export const getStudents = (departmentId = null) => {
    const params = departmentId ? { departmentId } : {};
    return apiClient.get('/students', { params });
};
export const addStudent = (studentData) => apiClient.post('/students', studentData);
export const updateStudent = (id, studentData) => apiClient.patch(`/students/${id}`, studentData);
export const deleteStudent = (id) => apiClient.delete(`/students/${id}`);
export const getStudentsForMarking = (departmentId) => apiClient.get('/attendance/students-for-marking', { params: { departmentId } });


// Attendance Service
export const getAttendance = (filters) => apiClient.get('/attendance', { params: filters }); // filters = { date, subjectId, departmentId, studentId }
export const markAttendance = (attendancePayload) => apiClient.post('/attendance/mark', attendancePayload); // payload = { date, subjectId, departmentId, attendanceData: [...] }

// Dashboard / Stats Service
export const getOverallStats = () => apiClient.get('/attendance/stats/overall');
export const getStatsByDepartment = () => apiClient.get('/attendance/stats/by-department');
export const getStatsBySubject = (departmentId = null) => {
    const params = departmentId ? { departmentId } : {};
    return apiClient.get('/attendance/stats/by-subject', { params });
};
