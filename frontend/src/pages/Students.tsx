import React, { useState, useEffect } from 'react';
import type { Student } from '../types/Student';
import studentService from '../services/studentService';
import Table from '../components/common/Table';
import type { Column } from '../components/common/Table';
import Card from '../components/common/Card';
import { HiUpload, HiSearch } from 'react-icons/hi';

export const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudents = async () => {
      const data = await studentService.getStudents();
      setStudents(data);
      setLoading(false);
    };
    loadStudents();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadMessage('Uploading...');
      const response = await studentService.uploadCSV(file);
      setUploadMessage(response.message);
      
      // Keep message for 4 seconds then clear
      setTimeout(() => {
        setUploadMessage('');
      }, 4000);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<Student>[] = [
    { header: 'ID', accessor: 'id' },
    { header: 'Roll No', accessor: 'rollNo' },
    { header: 'Name', accessor: 'name' },
    { header: 'Department', accessor: 'department' },
    { header: 'Section', accessor: 'section' },
    { header: 'Semester', accessor: (row) => row.semester ?? 'N/A' },
  ];

  return (
    <div className="space-y-6">
      <Card title="Student Directory Management">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, roll no, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-2 px-4 py-2 border border-indigo-600 rounded text-indigo-600 hover:bg-indigo-50 text-sm font-medium transition-colors">
                <HiUpload className="w-5 h-5" />
                Upload Student CSV
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {uploadMessage && (
              <span className="text-xs text-indigo-600 self-center">{uploadMessage}</span>
            )}
          </div>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading student directory...</div>
        ) : (
          <Table
            columns={columns}
            data={filteredStudents}
            rowKey={(student) => student.id}
            emptyMessage="No students match the search query."
          />
        )}
      </Card>
    </div>
  );
};
export default Students;
