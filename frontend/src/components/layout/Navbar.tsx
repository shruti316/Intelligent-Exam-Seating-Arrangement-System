import React from 'react';
import { HiMenuAlt2 } from 'react-icons/hi';

interface NavbarProps {
  title: string;
  onMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ title, onMenuToggle }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          type="button"
          className="p-2 text-gray-500 rounded lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Toggle menu"
        >
          <HiMenuAlt2 className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      </div>
      <div className="text-sm font-medium text-gray-500">
        {currentDate}
      </div>
    </header>
  );
};
export default Navbar;
