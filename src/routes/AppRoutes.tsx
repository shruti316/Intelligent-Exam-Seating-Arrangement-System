import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Dashboard from '../pages/Dashboard';
import Students from '../pages/Students';
import Classrooms from '../pages/Classrooms';
import Exams from '../pages/Exams';
import SeatingPlan from '../pages/SeatingPlan';
import NotFound from '../pages/NotFound';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/classrooms" element={<Classrooms />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/seating" element={<SeatingPlan />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
export default AppRoutes;
