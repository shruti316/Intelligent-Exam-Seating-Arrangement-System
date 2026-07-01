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
      <div className="flex items-center justify-center h-20 mt-[20px]">
          <div className="flex items-center gap-5">
            <div className=" p-2 text-[#222222] flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F1DDD8] to-[#E8ECE8] shadow-soft">
              <Sparkles size={20} />
            </div>
              <div className="font-['Cormorant_Garamond',serif]">
                <h1 className="text-3xl font-bold leading-none text-[#2D2825]">
                  SeatFlow
                </h1>
                <p className="mt-2 text-[11px] uppercase tracking-[0.28em] text-[#9B9087]">
                  Intelligent Allocation
                </p>
              </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-[#666666]">
            <X size={20} />
          </button>
        </div>

        <div className="my-6 h-px bg-[#ECE4DD]" />

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

        <div className="flex items-center px-5 gap-2"> 
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"/> 
            <p className="font-medium"> Engine Online </p>
          </div>
              <p className="mt-2 text-[#9B9087] px-8"> Version 1.0.0 </p>
      </aside>
    </>
  );
};

export default Sidebar; 