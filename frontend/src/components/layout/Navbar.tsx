import React from 'react';
import { Menu, Search } from 'lucide-react';

interface NavbarProps {
  onMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-20 xl:px-14 2xl:px-16 bg-[#FAF8F5]">
      <div>
        <h2 className="text-2xl font-['Cormorant_Garamond',serif] font-bold text-[#222222]">
          Good Morning,
        </h2>
        <p className="text-sm text-[#666666]">Your academic schedule at a glance.</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-sm font-medium text-[#666666] hidden md:block">
          {currentDate}
        </div>
        <button className="p-2 text-[#666666] hover:bg-white rounded-full transition-colors">
          <Search size={20} />
        </button>
        <div className="w-8 h-8 rounded-full bg-[#EBCFD2] border border-[#E7DDD5]" />
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-[#222222]"
        >
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
};

export default Navbar; 