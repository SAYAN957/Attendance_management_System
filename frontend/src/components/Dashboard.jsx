import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { getOverallStats, getStatsByDepartment, getStatsBySubject, getDepartments } from '../services/api';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

function Dashboard() {
  const [overallData, setOverallData] = useState(null);
  const [deptData, setDeptData] = useState(null);
  const [subjectData, setSubjectData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDeptForSubjectChart, setSelectedDeptForSubjectChart] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchDepartments(); // Fetch departments for the filter dropdown
  }, []);

   // Refetch subject chart data when department filter changes
  useEffect(() => {
    fetchSubjectStats(selectedDeptForSubjectChart || null);
  }, [selectedDeptForSubjectChart]);


  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [overallRes, deptRes] = await Promise.all([
        getOverallStats(),
        getStatsByDepartment(),
        // Fetch subject stats initially for all departments or wait for filter
        // fetchSubjectStats(null) // Fetch initially for all
      ]);

      // Process Overall Stats
      if (overallRes.data) {
        setOverallData({
          labels: ['Present', 'Absent'],
          datasets: [{
            label: 'Overall Attendance',
            data: [overallRes.data.Present || 0, overallRes.data.Absent || 0],
            backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
            borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
            borderWidth: 1,
          }],
        });
      }

      // Process Department Stats
      if (deptRes.data && deptRes.data.length > 0) {
         // For simplicity, let's show total present/absent across departments
         // A stacked bar chart might be better, but pie chart requested
         const totalPresent = deptRes.data.reduce((sum, dept) => sum + (dept.presentCount || 0), 0);
         const totalAbsent = deptRes.data.reduce((sum, dept) => sum + (dept.absentCount || 0), 0);

         setDeptData({
             labels: deptRes.data.map(d => d.departmentName), // Use department names as labels
             datasets: [{
                 label: 'Present Count', // Or combine present/absent?
                 data: deptRes.data.map(d => d.presentCount || 0),
                 // Add more datasets or adjust structure for better visualization if needed
                  backgroundColor: generateColors(deptRes.data.length), // Helper function needed
                  borderColor: generateBorderColors(deptRes.data.length), // Helper function needed
                  borderWidth: 1,
             }],
             // Alternative: Show Present vs Absent for *each* department in separate charts or tooltips
         });
      } else {
          setDeptData(null); // No data
      }


    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError('Failed to load some dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

   const fetchDepartments = async () => {
        try {
            const response = await getDepartments();
            setDepartments(response.data);
        } catch (err) {
            console.error("Failed to fetch departments for filter:", err);
            // Handle error silently or show a message
        }
    };


   const fetchSubjectStats = async (departmentId) => {
        setIsLoading(true); // Indicate loading for subject chart specifically
        try {
            const subjRes = await getStatsBySubject(departmentId); // Pass departmentId filter
             if (subjRes.data && subjRes.data.length > 0) {
                setSubjectData({
                    labels: subjRes.data.map(s => `${s.subjectName} (${s.subjectCode})`),
                    datasets: [{
                        label: 'Present Count',
                        data: subjRes.data.map(s => s.presentCount || 0),
                        backgroundColor: generateColors(subjRes.data.length),
                        borderColor: generateBorderColors(subjRes.data.length),
                        borderWidth: 1,
                    }],
                });
            } else {
                setSubjectData(null); // No data for this filter
            }
        } catch (err) {
             console.error("Error fetching subject stats:", err);
             setError(`Failed to load subject stats ${departmentId ? 'for the selected department' : ''}.`);
             setSubjectData(null);
        } finally {
             setIsLoading(false);
        }
    };


  // Helper functions to generate colors for charts
    const generateColors = (count) => {
        const colors = [];
        for (let i = 0; i < count; i++) {
            // Simple color generation, can be improved
            const r = Math.floor(Math.random() * 200);
            const g = Math.floor(Math.random() * 200);
            const b = Math.floor(Math.random() * 200);
            colors.push(`rgba(${r}, ${g}, ${b}, 0.6)`);
        }
        return colors;
    };
     const generateBorderColors = (count) => {
        // Could derive from background colors or generate separately
        return generateColors(count).map(color => color.replace('0.6', '1'));
    };


  const chartOptions = (title) => ({
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: title, font: { size: 16 } },
      tooltip: {
          callbacks: {
                label: function(context) {
                    let label = context.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed !== null) {
                        // For Pie charts, context.parsed is the value
                        label += context.parsed;
                    }
                    // You might want to calculate percentage here as well
                    // const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                    // const percentage = ((context.parsed / total) * 100).toFixed(2) + '%';
                    // label += ` (${percentage})`;
                    return label;
                }
            }
      }
    },
  });


  if (isLoading && !overallData && !deptData && !subjectData) { // Show loading only initially
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>

        {/* Overall Attendance Chart */}
        {overallData && (overallData.datasets[0].data[0] > 0 || overallData.datasets[0].data[1] > 0) ? (
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <Pie data={overallData} options={chartOptions('Overall Attendance Status')} />
          </div>
        ) : <p>No overall attendance data available.</p>}

        {/* Department Attendance Chart */}
         {deptData && deptData.datasets[0].data.some(d => d > 0) ? (
          <div style={{ width: '100%', maxWidth: '400px' }}>
             {/* Using Pie chart for department presence count as requested, though Bar might be better */}
            <Pie data={deptData} options={chartOptions('Attendance Presence Count by Department')} />
          </div>
        ) : <p>No department attendance data available.</p>}


         {/* Subject Attendance Chart with Filter */}
         <div style={{ width: '100%', maxWidth: '400px', marginTop: '2rem' }}>
             <h3>Attendance Presence Count by Subject</h3>
             <div style={{marginBottom: '1rem'}}>
                 <label htmlFor="deptFilterSubject">Filter by Department: </label>
                 <select
                     id="deptFilterSubject"
                     value={selectedDeptForSubjectChart}
                     onChange={(e) => setSelectedDeptForSubjectChart(e.target.value)}
                     disabled={isLoading}
                 >
                     <option value="">-- All Departments --</option>
                     {departments.map(dept => (
                         <option key={dept._id} value={dept._id}>{dept.name}</option>
                     ))}
                 </select>
             </div>
             {isLoading && <p>Loading subject data...</p>}
             {!isLoading && subjectData && subjectData.datasets[0].data.some(d => d > 0) ? (
                <Pie data={subjectData} options={chartOptions(`Subject Presence Count ${selectedDeptForSubjectChart ? ' (' + departments.find(d=>d._id === selectedDeptForSubjectChart)?.name + ')' : '(All Depts)'}`)} />
             ) : !isLoading && <p>No subject attendance data available for the selected filter.</p>}
         </div>

      </div>
    </div>
  );
}

export default Dashboard;
