import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Building2,
  ClipboardList,
  Award,
  Ban,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  mockPendingApplications,
  mockRegisteredUniversities,
  mockIssuedCertificates,
} from "../../data/mockData";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const validCount = mockIssuedCertificates.filter(
    (c) => c.status === "valid",
  ).length;
  const revokedCount = mockIssuedCertificates.filter(
    (c) => c.status === "revoked",
  ).length;

  const pieData = [
    { name: "Valid", value: validCount },
    { name: "Revoked", value: revokedCount },
  ];

  const COLORS = ["#16A34A", "#DC2626"];

  const monthlyData = [
    { month: "Jan", certificates: 45 },
    { month: "Feb", certificates: 62 },
    { month: "Mar", certificates: 38 },
    { month: "Apr", certificates: 89 },
    { month: "May", certificates: 124 },
    { month: "Jun", certificates: 97 },
    { month: "Jul", certificates: 143 },
    { month: "Aug", certificates: 112 },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "approved",
      target: "Harvard University",
      date: "2024-01-10",
      type: "university",
    },
    {
      id: 2,
      action: "rejected",
      target: "MIT Extension",
      date: "2024-01-09",
      type: "university",
    },
    {
      id: 3,
      action: "suspended",
      target: "Cambridge University",
      date: "2024-01-08",
      type: "university",
    },
    {
      id: 4,
      action: "revoked",
      target: "CERT789012",
      date: "2024-01-07",
      type: "certificate",
    },
    {
      id: 5,
      action: "approved",
      target: "Stanford University",
      date: "2024-01-06",
      type: "university",
    },
  ];

  const getActionIcon = (action) => {
    switch (action) {
      case "approved":
        return <CheckCircle2 size={16} color="#16A34A" />;
      case "rejected":
        return <XCircle size={16} color="#DC2626" />;
      case "suspended":
        return <Ban size={16} color="#D97706" />;
      case "revoked":
        return <AlertCircle size={16} color="#D97706" />;
      default:
        return null;
    }
  };

  const suspendedUniversitiesCount = mockRegisteredUniversities.filter(
    (u) => u.status === "suspended",
  ).length;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>Dashboard</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Welcome back, {user?.name || 'Admin'}
          </p>
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          {today}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div
              className="stat-icon"
              style={{ backgroundColor: "var(--primary-light)" }}
            >
              <Building2 color="var(--primary)" size={20} />
            </div>
            <span className="stat-trend" style={{ color: "var(--success)" }}>
              Registered in system
            </span>
          </div>
          <div>
            <div className="stat-number">
              {mockRegisteredUniversities.length}
            </div>
            <div className="stat-label">Total Universities</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div
              className="stat-icon"
              style={{ backgroundColor: "var(--revoked-badge-bg)" }}
            >
              <ClipboardList color="var(--revoked-badge-text)" size={20} />
            </div>
            <span className="stat-trend" style={{ color: "var(--warning)" }}>
              Awaiting review
            </span>
          </div>
          <div>
            <div className="stat-number">{mockPendingApplications.length}</div>
            <div className="stat-label">Pending Applications</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div
              className="stat-icon"
              style={{ backgroundColor: "var(--valid-badge-bg)" }}
            >
              <Award color="var(--valid-badge-text)" size={20} />
            </div>
            <span className="stat-trend" style={{ color: "var(--success)" }}>
              Issued on blockchain
            </span>
          </div>
          <div>
            <div className="stat-number">{mockIssuedCertificates.length}</div>
            <div className="stat-label">Total Certificates</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon" style={{ backgroundColor: "#FEE2E2" }}>
              <Ban color="#DC2626" size={20} />
            </div>
            <span className="stat-trend" style={{ color: "#DC2626" }}>
              Access restricted
            </span>
          </div>
          <div>
            <div className="stat-number">{suspendedUniversitiesCount}</div>
            <div className="stat-label">Suspended Universities</div>
          </div>
        </div>
      </div>

      <div
        className="charts-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <div
          className="card"
          style={{ padding: "24px", backgroundColor: "var(--bg-card)" }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "16px",
            }}
          >
            Certificates Issued per Month
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
              />
              <YAxis tick={{ fontSize: 12, fill: "var(--text-secondary)" }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="certificates"
                stroke="#1B3A6B"
                strokeWidth={2.5}
                dot={{ fill: "#C9973A", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div
          className="card"
          style={{ padding: "24px", backgroundColor: "var(--bg-card)" }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "16px",
            }}
          >
            Certificate Status
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div
        className="bottom-grid"
        style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}
      >
        <div
          className="card"
          style={{ padding: "24px", backgroundColor: "var(--bg-card)" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: "600" }}>
              Recent Activity
            </h3>
            <span
              style={{
                color: "var(--accent)",
                fontSize: "13px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              View All &rarr;
            </span>
          </div>
          <div>
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border)",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--primary-light)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <div style={{ marginRight: "16px", marginTop: "4px" }}>
                  {getActionIcon(activity.action)}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      textTransform: "capitalize",
                    }}
                  >
                    {activity.action}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    {activity.target}
                  </div>
                </div>
                <div
                  style={{ fontSize: "12px", color: "var(--text-secondary)" }}
                >
                  {activity.date}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div
            className="card"
            style={{ padding: "24px", marginBottom: "20px" }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "16px",
              }}
            >
              Quick Actions
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <button
                onClick={() => navigate("/admin/pending")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  backgroundColor: "#1B3A6B",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  width: "100%",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.9)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
              >
                <ClipboardList size={18} style={{ marginRight: "10px" }} />
                Review Applications
                {mockPendingApplications.length > 0 && (
                  <span
                    style={{
                      background: "#DC2626",
                      color: "white",
                      borderRadius: "999px",
                      fontSize: "11px",
                      padding: "2px 7px",
                      marginLeft: "auto",
                    }}
                  >
                    {mockPendingApplications.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate("/admin/universities")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  backgroundColor: "transparent",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  width: "100%",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--bg-app)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Building2
                  size={18}
                  style={{ marginRight: "10px", color: "var(--primary)" }}
                />
                Manage Universities
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: "24px" }}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "16px",
              }}
            >
              Notifications
            </h3>

            {mockPendingApplications.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  padding: "10px",
                  background: "#FEF3C7",
                  borderRadius: "8px",
                  border: "1px solid #FDE68A",
                  marginBottom: "8px",
                }}
              >
                <AlertCircle
                  size={16}
                  color="#D97706"
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#92400E",
                    }}
                  >
                    {mockPendingApplications.length} Applications Pending
                  </div>
                  <div style={{ fontSize: "12px", color: "#B45309" }}>
                    Review and approve university registrations
                  </div>
                </div>
              </div>
            )}

            {suspendedUniversitiesCount > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  padding: "10px",
                  background: "#FFF1F2",
                  borderRadius: "8px",
                  border: "1px solid #FECDD3",
                  marginBottom: "8px",
                }}
              >
                <Ban
                  size={16}
                  color="#DC2626"
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#991B1B",
                    }}
                  >
                    {suspendedUniversitiesCount} Universities Suspended
                  </div>
                  <div style={{ fontSize: "12px", color: "#B91C1C" }}>
                    Some universities have restricted access
                  </div>
                </div>
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "10px",
                padding: "10px",
                background: "#F0FDF4",
                borderRadius: "8px",
                border: "1px solid #BBF7D0",
              }}
            >
              <CheckCircle2
                size={16}
                color="#16A34A"
                style={{ flexShrink: 0, marginTop: 2 }}
              />
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#166534",
                  }}
                >
                  System Operational
                </div>
                <div style={{ fontSize: "12px", color: "#16A34A" }}>
                  All blockchain services running normally
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
