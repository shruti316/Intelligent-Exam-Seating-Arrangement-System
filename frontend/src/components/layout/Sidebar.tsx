import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  School,
  CalendarDays,
  Armchair,
  Sparkles,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Classrooms', path: '/classrooms', icon: School },
    { name: 'Exams', path: '/exams', icon: CalendarDays },
    { name: 'Seating Plan', path: '/seating', icon: Armchair },
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-20 bg-black/20 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col w-72 bg-[#F7F4EF] transition-transform duration-300 ease-in-out border-r border-[#E7DDD5] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static`}
      >
        <div className="flex items-center justify-between h-20 px-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#EBCFD2] p-2 rounded-lg text-[#222222]">
              <Sparkles size={20} />
            </div>
            <div className="font-['Cormorant_Garamond',serif]">
              <h1 className="text-lg font-bold leading-none text-[#222222]">Exam</h1>
              <h1 className="text-lg font-bold leading-none text-[#222222]">Seating</h1>
              <p className="text-[10px] text-[#666666] tracking-wider uppercase mt-0.5">Intelligent Allocation</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-[#666666]">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-[#222222] shadow-sm border border-[#E7DDD5] font-semibold'
                    : 'text-[#666666] hover:bg-white hover:shadow-sm hover:-translate-y-[1px]'
                }`
              }
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-6 border-t border-[#E7DDD5] text-[11px] text-[#666666]">
          <p className="font-semibold">Allocation Engine</p>
          <p>Version 1.0</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar; 