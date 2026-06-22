import React, { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (path: string): string => {
    switch (path) {
      case '/':
        return 'Dashboard';
      case '/students':
        return 'Students Directory';
      case '/classrooms':
        return 'Classrooms Registry';
      case '/exams':
        return 'Exams Scheduler';
      case '/seating':
        return 'Seating Plan Generator';
      default:
        return 'Page Not Found';
    }
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content viewport */}
      <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
        <Navbar title={pageTitle} onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default Layout;
