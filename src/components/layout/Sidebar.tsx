import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HiOutlineViewGrid,
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineTable,
  HiX
} from 'react-icons/hi';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: HiOutlineViewGrid },
    { name: 'Students', path: '/students', icon: HiOutlineUserGroup },
    { name: 'Classrooms', path: '/classrooms', icon: HiOutlineAcademicCap },
    { name: 'Exams', path: '/exams', icon: HiOutlineCalendar },
    { name: 'Seating Plan', path: '/seating', icon: HiOutlineTable },
  ];

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-20 bg-gray-900 bg-opacity-50 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col w-64 bg-indigo-900 text-white transition-transform duration-200 transform border-r border-indigo-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:h-screen`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-indigo-800">
          <div className="text-lg font-bold tracking-wider text-white">
            Seatflow Admin
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 text-indigo-200 rounded lg:hidden hover:text-white hover:bg-indigo-800 focus:outline-none"
            aria-label="Close menu"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded transition-colors duration-150 ${
                  isActive
                    ? 'bg-indigo-800 text-white border-l-4 border-indigo-400 -ml-1'
                    : 'text-indigo-200 hover:text-white hover:bg-indigo-800'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-indigo-800 text-xs text-indigo-300">
          <div>Allocation Engine v1.0.0</div>
          <div>React + C++ Bridge</div>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
