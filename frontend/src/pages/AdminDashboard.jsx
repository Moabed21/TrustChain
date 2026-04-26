import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '../components/shared/Sidebar';
import PendingApplications from '../components/admin/PendingApplications';
import RegisteredUniversities from '../components/admin/RegisteredUniversities';
import Dashboard from '../components/admin/Dashboard';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      <button
        className="hamburger-btn"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={20} />
      </button>
      <Sidebar role="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content" style={{ flex: 1, marginLeft: 'var(--sidebar-w)', padding: '32px 48px' }}>
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pending" element={<PendingApplications />} />
          <Route path="universities" element={<RegisteredUniversities />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
