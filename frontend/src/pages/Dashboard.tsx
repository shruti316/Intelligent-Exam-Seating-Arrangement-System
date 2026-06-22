import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import studentService from '../services/studentService';
import classroomService from '../services/classroomService';
import examService from '../services/examService';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClassrooms: 0,
    totalExams: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const students = await studentService.getStudents();
        const classrooms = await classroomService.getClassrooms();
        const exams = await examService.getExams();
        
        setStats({
          totalStudents: students.length,
          totalClassrooms: classrooms.length,
          totalExams: exams.length,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to Seatflow Admin Console</h2>
        <p className="text-sm text-gray-600">
          This system allocates student seats in exams using custom classroom geometries. Use the sidebar to manage students, classrooms, exams, and generate seating plans.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card title="Total Students">
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-gray-900">
              {loading ? '...' : stats.totalStudents}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Registered student profiles</p>
        </Card>

        <Card title="Total Classrooms">
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-gray-900">
              {loading ? '...' : stats.totalClassrooms}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Available exam seating venues</p>
        </Card>

        <Card title="Total Exams">
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-gray-900">
              {loading ? '...' : stats.totalExams}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Scheduled subjects and sessions</p>
        </Card>
      </div>
    </div>
  );
};
export default Dashboard;
