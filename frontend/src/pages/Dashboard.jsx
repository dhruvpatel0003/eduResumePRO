import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 style={{ fontSize: '28px', color: '#1f2937', marginBottom: '24px' }}>Dashboard</h1>

      <div style={{ border: '1px solid #e5e7eb', padding: '20px', borderRadius: '8px', background: '#fff' }}>
        <h2>Welcome, {user?.name}!</h2>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Your Resumes</h3>
        <p style={{ color: '#6b7280' }}>No resumes yet. Start creating one!</p>
      </div>
    </div>
  );
};

export default Dashboard;
