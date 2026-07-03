import React, { useState, useEffect } from 'react';
import type { Classroom } from '../types/Classroom';
import classroomService from '../services/classroomService';
import Table from '../components/common/Table';
import type { Column } from '../components/common/Table';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Plus, Edit, Trash2, X } from 'lucide-react';

export const Classrooms: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [roomNo, setRoomNo] = useState('');
  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(6);
  const [zone, setZone] = useState('Block A');
  const [validationError, setValidationError] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadClassrooms = async () => {
    try {
      setLoading(true);
      const data = await classroomService.getClassrooms();
      setClassrooms(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load classrooms.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClassrooms();
  }, []);

  const handleOpenAddModal = () => {
    setEditingClassroom(null);
    setRoomNo('');
    setRows(6);
    setCols(6);
    setZone('Block A');
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (room: Classroom) => {
    setEditingClassroom(room);
    setRoomNo(room.roomNo);
    setRows(room.rows);
    setCols(room.cols);
    setZone(room.zone);
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleDeleteClassroom = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this classroom? Seating plans using this room may be affected.')) {
      try {
        await classroomService.deleteClassroom(id);
        showToast('Classroom deleted successfully.');
        loadClassrooms();
      } catch (err: any) {
        showToast(err.message || 'Failed to delete classroom.', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!roomNo.trim()) return setValidationError('Room number is required.');
    if (rows < 1 || rows > 30) return setValidationError('Rows must be between 1 and 30.');
    if (cols < 1 || cols > 30) return setValidationError('Columns must be between 1 and 30.');
    if (!zone.trim()) return setValidationError('Zone block is required.');

    const capacity = rows * cols;
    const newRoomData = {
      roomNo: roomNo.trim(),
      rows,
      cols,
      capacity,
      zone: zone.trim()
    };

    try {
      if (editingClassroom) {
        await classroomService.updateClassroom(editingClassroom.id, newRoomData);
        showToast('Classroom layout updated successfully.');
      } else {
        await classroomService.addClassroom(newRoomData);
        showToast('Classroom layout saved successfully.');
      }
      setIsModalOpen(false);
      loadClassrooms();
    } catch (err: any) {
      setValidationError(err.message || 'Failed to save classroom.');
    }
  };

  const columns: Column<Classroom>[] = [
    { header: 'Room No', accessor: 'roomNo' },
    { header: 'Rows', accessor: 'rows' },
    { header: 'Columns', accessor: 'cols' },
    { header: 'Capacity (Rows × Cols)', accessor: (row) => `${row.capacity} desks` },
    { header: 'Zone', accessor: 'zone' },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleOpenEditModal(row)}
            className="text-slate-600 hover:text-indigo-600 p-1 rounded-lg hover:bg-slate-100 transition"
            title="Edit classroom layout"
          >
            <Edit size={15} />
          </button>
          <button 
            onClick={() => handleDeleteClassroom(row.id)}
            className="text-slate-600 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-100 transition"
            title="Delete classroom record"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="font-['Manrope',sans-serif] space-y-6">
      
      {/* Toast message container */}
      {toast && (
        <div className="fixed right-8 top-8 z-50 flex items-center gap-3 rounded-2xl border border-[#E7DDD5] bg-white px-5 py-3 shadow-xl animate-in slide-in-from-top-4">
          <span className={`text-xs font-semibold ${toast.type === 'error' ? 'text-rose-600' : 'text-emerald-700'}`}>
            {toast.message}
          </span>
        </div>
      )}

      <Card
        title="Classrooms Configuration"
        headerActions={
          <Button onClick={handleOpenAddModal} variant="primary" size="sm" className="gap-2 rounded-xl">
            <Plus className="w-4 h-4" />
            Add Classroom
          </Button>
        }
      >
        <p className="text-xs text-gray-500">
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

      {/* Add / Edit Classroom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-[#E7DDD5] bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-slate-50">
              <h3 className="font-semibold text-lg text-slate-800">
                {editingClassroom ? 'Edit Classroom Layout' : 'Add New Classroom'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200 transition">
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {validationError && (
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold border border-rose-100">
                  {validationError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Room No</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LH-301"
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                  className="block w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm outline-none transition focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Rows Grid</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={30}
                    value={rows}
                    onChange={(e) => setRows(Number(e.target.value))}
                    className="block w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm outline-none transition focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Columns Grid</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={30}
                    value={cols}
                    onChange={(e) => setCols(Number(e.target.value))}
                    className="block w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm outline-none transition focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Zone Block</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Block C"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="block w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm outline-none transition focus:border-indigo-500"
                />
              </div>

              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 text-xs text-amber-800">
                Total Seating Capacity: <span className="font-mono font-bold">{rows * cols} Desks</span>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                <Button type="button" onClick={() => setIsModalOpen(false)} variant="outline" className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  {editingClassroom ? 'Save Changes' : 'Save Classroom'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Classrooms;
