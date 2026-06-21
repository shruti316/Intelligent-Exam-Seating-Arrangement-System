import React, { useState, useEffect } from 'react';
import type { Classroom } from '../types/Classroom';
import classroomService from '../services/classroomService';
import Table from '../components/common/Table';
import type { Column } from '../components/common/Table';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { HiPlus } from 'react-icons/hi';

export const Classrooms: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form states for simple mock addition
  const [roomNo, setRoomNo] = useState('');
  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(6);
  const [zone, setZone] = useState('Block A');

  useEffect(() => {
    const loadClassrooms = async () => {
      const data = await classroomService.getClassrooms();
      setClassrooms(data);
      setLoading(false);
    };
    loadClassrooms();
  }, []);

  const handleAddClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNo.trim()) return;

    const capacity = rows * cols;
    const newRoomData = {
      roomNo,
      rows,
      cols,
      capacity,
      zone
    };

    const addedRoom = await classroomService.addClassroom(newRoomData);
    setClassrooms((prev) => [...prev, addedRoom]);
    
    // Reset Form
    setRoomNo('');
    setRows(6);
    setCols(6);
    setZone('Block A');
    setIsAdding(false);
  };

  const columns: Column<Classroom>[] = [
    { header: 'Room No', accessor: 'roomNo' },
    { header: 'Rows', accessor: 'rows' },
    { header: 'Columns', accessor: 'cols' },
    { header: 'Capacity (Rows × Cols)', accessor: 'capacity' },
    { header: 'Zone', accessor: 'zone' },
  ];

  return (
    <div className="space-y-6">
      <Card
        title="Classrooms Configuration"
        headerActions={
          !isAdding && (
            <Button onClick={() => setIsAdding(true)} variant="primary" size="sm" className="gap-2">
              <HiPlus className="w-4 h-4" />
              Add Classroom
            </Button>
          )
        }
      >
        {isAdding && (
          <form onSubmit={handleAddClassroom} className="p-4 border border-gray-200 rounded bg-gray-50 space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Add New Classroom Layout</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Room No</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LH-301"
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                  className="block w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Rows Grid</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={20}
                  value={rows}
                  onChange={(e) => setRows(Number(e.target.value))}
                  className="block w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Columns Grid</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={20}
                  value={cols}
                  onChange={(e) => setCols(Number(e.target.value))}
                  className="block w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Zone Block</label>
                <input
                  type="text"
                  placeholder="e.g. Block C"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="block w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" onClick={() => setIsAdding(false)} variant="outline" size="sm">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Classroom
              </Button>
            </div>
          </form>
        )}
        
        <p className="text-xs text-gray-500 mt-2">
          Capacity is calculated dynamically based on (Rows × Columns) layout dimensions.
        </p>
      </Card>

      <Card>
        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading classrooms...</div>
        ) : (
          <Table
            columns={columns}
            data={classrooms}
            rowKey={(classroom) => classroom.id}
            emptyMessage="No classrooms defined yet."
          />
        )}
      </Card>
    </div>
  );
};
export default Classrooms;
