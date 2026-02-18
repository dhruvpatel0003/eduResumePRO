import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import ProfessorDashboard from './ProfessorDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const userRole = user?.role || 'student';

  if (userRole === 'professor') {
    return <ProfessorDashboard />;
  }

  return <StudentDashboard />;
};

export default Dashboard;
