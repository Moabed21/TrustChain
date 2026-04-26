import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '../components/shared/Sidebar';
import Dashboard from '../components/university/Dashboard';
import IssueCertificate from '../components/university/IssueCertificate';
import IssuedCertificates from '../components/university/IssuedCertificates';

const UniversityDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      <button
        className="hamburger-btn"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={20} />
      </button>
      <Sidebar role="university" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content" style={{ flex: 1, marginLeft: 'var(--sidebar-w)', padding: '32px 48px' }}>
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="issue" element={<IssueCertificate />} />
          <Route path="certificates" element={<IssuedCertificates />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default UniversityDashboard;
