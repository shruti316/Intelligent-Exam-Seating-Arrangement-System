import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineInbox } from 'react-icons/hi';

export const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      {/* Decorative Exam Desk Element */}
      <div className="relative mb-8 w-64 h-48 bg-slate-100 dark:bg-slate-800 border-4 border-slate-300 dark:border-slate-700 rounded-2xl shadow-lg flex flex-col items-center justify-between p-6 overflow-hidden">
        {/* Desk top details */}
        <div className="w-full flex justify-between items-center text-xs font-semibold text-slate-400">
          <span>DESK NO: 404</span>
          <span>ZONE: LOST</span>
        </div>
        
        {/* Seat visual */}
        <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center border-2 border-indigo-300 dark:border-indigo-800 animate-bounce">
          <HiOutlineInbox className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>

        {/* Candidate tag */}
        <div className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm">
          CANDIDATE: NOT FOUND
        </div>

        {/* Desk borders/shadows */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-300 dark:bg-slate-700" />
      </div>

      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
        Absent Page!
      </h1>
      
      <p className="text-base text-slate-600 dark:text-slate-400 max-w-md mb-8">
        The classroom you are looking for does not exist, or the candidate at this URL is currently absent from the roster.
      </p>

      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
