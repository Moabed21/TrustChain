// Dashboard.jsx
// university dashboard — shows stats and recent certificates
// fetches real certificate data from backend on mount via listCertificatesAPI
// stats (total, valid, revoked, this month) are computed from the real data

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Award, CheckCircle2, XCircle, CalendarDays, PlusCircle, LayoutList, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { listCertificatesAPI } from "../../services/api";
import StatusBadge from "../shared/StatusBadge";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [certificates, setCertificates] = useState([]); // real data from backend
  const [loading, setLoading] = useState(true);

  // fetch all certificates for this university on mount
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const data = await listCertificatesAPI();
        setCertificates(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("listCertificatesAPI failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // compute stats from real data
  const total = certificates.length;
  const totalValid = certificates.filter((c) => c.status === "Issued").length;
  const totalRevoked = certificates.filter((c) => c.status === "Revoked").length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonth = certificates.filter((c) => {
    const d = new Date(c.issue_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const validPercentage = total ? Math.round((totalValid / total) * 100) : 0;
  const revokedPercentage = total ? Math.round((totalRevoked / total) * 100) : 0;
  const currentMonthName = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // show 5 most recent certificates in the recent table
  const recent = [...certificates].slice(-5).reverse();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
        <Loader2 size={32} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div>
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px", color: "var(--text-primary)" }}>
            Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Welcome back, {user?.email?.split("@")[0] || "University"}
          </p>
        </div>
        <div className="page-date">{todayFormatted}</div>
      </div>

      {/* stats cards — computed from real certificate data */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon" style={{ backgroundColor: "var(--stat-icon-blue-bg)", color: "var(--stat-icon-blue-text)" }}>
              <Award size={24} />
            </div>
            <span className="stat-trend">All time</span>
          </div>
          <div className="stat-number" style={{ fontFamily: "'Exo 2', sans-serif" }}>{total}</div>
          <div className="stat-label">Total Certificates Issued</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon" style={{ backgroundColor: "var(--valid-badge-bg)", color: "var(--success)" }}>
              <CheckCircle2 size={24} />
            </div>
            <span className="stat-trend">{validPercentage}% of total</span>
          </div>
          <div className="stat-number" style={{ fontFamily: "'Exo 2', sans-serif" }}>{totalValid}</div>
          <div className="stat-label">Valid Certificates</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon" style={{ backgroundColor: "var(--invalid-badge-bg)", color: "var(--danger)" }}>
              <XCircle size={24} />
            </div>
            <span className="stat-trend">{revokedPercentage}% of total</span>
          </div>
          <div className="stat-number" style={{ fontFamily: "'Exo 2', sans-serif" }}>{totalRevoked}</div>
          <div className="stat-label">Revoked Certificates</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon" style={{ backgroundColor: "var(--stat-icon-purple-bg)", color: "var(--stat-icon-purple-text)" }}>
              <CalendarDays size={24} />
            </div>
            <span className="stat-trend">{currentMonthName}</span>
          </div>
          <div className="stat-number" style={{ fontFamily: "'Exo 2', sans-serif" }}>{thisMonth}</div>
          <div className="stat-label">Issued This Month</div>
        </div>
      </div>

      {/* quick actions */}
      <h2 className="section-title">Quick Actions</h2>
      <div className="quick-actions">
        <button className="btn btn-primary" onClick={() => navigate("/university/issue")}>
          <PlusCircle size={16} />
          Issue New Certificate
        </button>
        <button className="btn btn-outline" onClick={() => navigate("/university/certificates")}>
          <LayoutList size={16} />
          View All Certificates
        </button>
      </div>

      {/* recent certificates — last 5 */}
      <div className="section-header">
        <h2 className="section-title" style={{ margin: 0 }}>Recent Certificates</h2>
        <span className="section-link" onClick={() => navigate("/university/certificates")}>
          View All &rarr;
        </span>
      </div>

      <div className="card">
        {recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Award size={28} color="var(--primary)" />
            </div>
            <p className="empty-state-title">No Recent Certificates</p>
            <p className="empty-state-subtitle">Issue your first certificate to see it here</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Certificate Hash</th>
                  <th>Issue Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((cert) => (
                  <tr key={cert._id}>
                    <td style={{ fontWeight: "500", color: "var(--text-primary)" }}>{cert.student_name}</td>
                    <td className="mono" style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      {cert.hashed_certificate}
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {new Date(cert.issue_date).toLocaleDateString()}
                    </td>
                    <td><StatusBadge status={cert.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
