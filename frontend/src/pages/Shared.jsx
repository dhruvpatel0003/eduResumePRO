import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentShared from './StudentShared';
import ProfessorSharedWithList from './ProfessorSharedWithList';

const Shared = () => {
  const { user } = useAuth();
  const userRole = user?.role || 'student';

  if (userRole === 'professor') {
    return <ProfessorSharedWithList />;
  }

  return <StudentShared />;
};

export default Shared;
