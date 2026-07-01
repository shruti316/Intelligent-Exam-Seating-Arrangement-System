import React from "react";
import {
  Menu,
  Search,
  Bell,
  Settings,
  User,
} from "lucide-react";

interface NavbarProps {
  onMenuToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-[#FAF8F5] px-8 py-6 xl:px-14 2xl:px-16">

      {/* Left */}

      <div>

        <p className="text-xs uppercase tracking-[0.28em] text-[#9B9087]">

          Intelligent Exam Allocation

        </p>
        <h1 className="mt-2 font-['Cormorant_Garamond',serif] text-[44px] font-bold leading-none text-[#2D2825]">
             Good Morning
        </h1>

        <p className="mt-2 text-[15px] text-[#736B65]">

          Manage examinations, classrooms and seating allocations.

        </p>

      </div>

      {/* Right */}

      <div className="flex items-center gap-4">

        {/* Date */}

        <div className="hidden rounded-2xl border border-[#ECE4DD] bg-white px-5 py-3 shadow-card xl:block">

          <p className="text-xs uppercase tracking-[0.18em] text-[#9A918A]">

            Today

          </p>

          <p className="mt-1 text-sm font-medium text-[#2D2825]">

            {currentDate}

          </p>

        </div>

        {/* Search */}

        <div className="hidden items-center gap-3 rounded-2xl border border-[#ECE4DD] bg-white px-4 py-3 shadow-card lg:flex">

          <Search
            size={18}
            className="text-[#9B9188]"
          />

          <input
            type="text"
            placeholder="Search..."
            className="w-52 bg-transparent text-sm text-[#3C3733] placeholder:text-[#A49B94] outline-none"
          />

        </div>

        {/* Notification */}

        <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ECE4DD] bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-hover">

          <Bell
            size={18}
            className="text-[#5F5954]"
          />

        </button>

        {/* Settings */}

        <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ECE4DD] bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-hover">

          <Settings
            size={18}
            className="text-[#5F5954]"
          />

        </button>

        {/* Avatar */}

        <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F2DDD7] to-[#E7ECE8] shadow-card border border-[#E7DDD5] transition-all hover:-translate-y-0.5 hover:shadow-hover">

          <User
            size={20}
            className="text-[#5A534E]"
          />

        </button>

        {/* Mobile Menu */}

        <button
          onClick={onMenuToggle}
          className="rounded-2xl border border-[#ECE4DD] bg-white p-3 shadow-card lg:hidden"
        >

          <Menu
            size={22}
            className="text-[#2D2825]"
          />

        </button>

      </div>

    </header>
  );
};

export default Navbar;