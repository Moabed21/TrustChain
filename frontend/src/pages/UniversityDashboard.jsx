import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "../components/shared/Sidebar";
import Dashboard from "../components/university/Dashboard";
import IssueCertificate from "../components/university/IssueCertificate";
import IssuedCertificates from "../components/university/IssuedCertificates";
import WalletSetup from "../components/university/WalletSetup";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";

const UniversityDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { pendingPassword } = useWallet();

  //to know if the user has a wallet to check if it is first login to generate wallet
  if (!user?.wallet_address) {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          backgroundColor: "var(--bg-app)",
        }}
      >
        <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
          <Menu size={20} />
        </button>
        <Sidebar
          role="university"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div
          className="main-content"
          style={{
            flex: 1,
            marginLeft: "var(--sidebar-w)",
            padding: "32px 48px",
          }}
        >
          <WalletSetup password={pendingPassword} />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--bg-app)",
      }}
    >
      <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
        <Menu size={20} />
      </button>
      <Sidebar
        role="university"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div
        className="main-content"
        style={{
          flex: 1,
          marginLeft: "var(--sidebar-w)",
          padding: "32px 48px",
        }}
      >
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
