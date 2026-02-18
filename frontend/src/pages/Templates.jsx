import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentTemplates from './StudentTemplates';
import ProfessorTemplates from './ProfessorTemplates';

const Templates = () => {
  const { user } = useAuth();
  const userRole = user?.role || 'student';

  if (userRole === 'professor') {
    return <ProfessorTemplates />;
  }

  return <StudentTemplates />;
};

export default Templates;
