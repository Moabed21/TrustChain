import React, { useState, useEffect } from "react";
import { Ban, Play, Search, Loader2 } from "lucide-react";
import {
  getAllUniversitiesAPI,
  suspendUniversityAPI,
  reactivateUniversityAPI,
} from "../../services/api";
import StatusBadge from "../shared/StatusBadge";
import ConfirmModal from "../shared/ConfirmModal";

const RegisteredUniversities = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    target: null,
  });
  const [searchQuery, setSearchQuery] = useState("");

  // fetch all universities from backend on mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const data = await getAllUniversitiesAPI();
        setUniversities(Array.isArray(data) ? data : []);
      } catch (err) {
        setFetchError(err.response?.data?.detail || "Failed to load universities");
      } finally {
        setLoading(false);
      }
    };
    fetchUniversities();
  }, []);

  const filteredUniversities = universities.filter((uni) => {
    const query = searchQuery.toLowerCase();
    return (
      uni.university_name?.toLowerCase().includes(query) ||
      uni.country?.toLowerCase().includes(query) ||
      new Date(uni.register_date)
        .toLocaleDateString()
        .toLowerCase()
        .includes(query)
    );
  });

  const handleToggleStatus = (uni, action) => {
    setModalState({ isOpen: true, type: action, target: uni });
  };

  const confirmAction = async () => {
    const { type, target } = modalState;
    setActionLoading(true);
    try {
      if (type === "suspend") {
        await suspendUniversityAPI(target._id);
        setUniversities((prev) =>
          prev.map((uni) =>
            uni._id === target._id ? { ...uni, status: "Suspended" } : uni,
          ),
        );
      } else if (type === "reactivate") {
        await reactivateUniversityAPI(target._id);
        setUniversities((prev) =>
          prev.map((uni) =>
            uni._id === target._id ? { ...uni, status: "Active" } : uni,
          ),
        );
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message = typeof detail === "object" ? detail.message : detail;
      setActionError(message || `Failed to ${type} university`);
    } finally {
      setActionLoading(false);
      setModalState({ isOpen: false, type: null, target: null });
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "300px",
        }}
      >
        <Loader2
          size={32}
          className="spin"
          style={{
            color: "var(--primary)",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div
        style={{ padding: "24px", textAlign: "center", color: "var(--danger)" }}
      >
        <p>{fetchError}</p>
        <button
          className="btn btn-primary"
          style={{ marginTop: "12px" }}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>
          Registered Universities
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Manage universities registered in the system
        </p>
      </div>

      {/* inline error banner for action errors */}
      {actionError && (
        <div style={{
          padding: "12px 16px",
          backgroundColor: "var(--invalid-badge-bg)",
          color: "var(--danger)",
          borderRadius: "8px",
          marginBottom: "16px",
          fontSize: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span>{actionError}</span>
          <button
            onClick={() => setActionError("")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontSize: "18px", lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <div style={{ position: "relative", width: "300px" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            placeholder="Search by name, country, or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "36px" }}
          />
        </div>
        {searchQuery && (
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            {filteredUniversities.length} result(s) found
          </span>
        )}
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>University Name</th>
                <th>Country</th>
                <th>Status</th>
                <th>Registered Date</th>
                <th>Certificates Issued</th>
                <th>Wallet Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUniversities.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Search size={28} color="var(--primary)" />
                      </div>
                      <p className="empty-state-title">No Results Found</p>
                      <p className="empty-state-subtitle">
                        Try adjusting your search query
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUniversities.map((uni) => (
                  <tr key={uni._id}>
                    <td className="font-medium">{uni.university_name}</td>
                    <td>{uni.country}</td>
                    <td>
                      <StatusBadge status={uni.status} />
                    </td>
                    <td>{new Date(uni.register_date).toLocaleDateString()}</td>
                    <td>{uni.total_certificates}</td>
                    <td className="mono text-sm">{uni.wallet_address || ""}</td>
                    <td>
                      {uni.status === "Active" ? (
                        <button
                          className="btn btn-orange"
                          style={{ padding: "6px 12px" }}
                          onClick={() => handleToggleStatus(uni, "suspend")}
                        >
                          <Ban size={16} /> Suspend
                        </button>
                      ) : (
                        <button
                          className="btn btn-green"
                          style={{ padding: "6px 12px" }}
                          onClick={() => handleToggleStatus(uni, "reactivate")}
                        >
                          <Play size={16} /> Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={modalState.isOpen}
        title={
          modalState.type === "suspend"
            ? "Suspend University"
            : "Reactivate University"
        }
        message={
          modalState.type === "suspend"
            ? `Are you sure you want to suspend ${modalState.target?.university_name}? They will no longer be able to issue new certificates until reactivated.`
            : `Are you sure you want to reactivate ${modalState.target?.university_name}? They will be able to issue certificates again.`
        }
        confirmLabel={
          actionLoading
            ? "Processing..."
            : modalState.type === "suspend"
              ? "Suspend"
              : "Reactivate"
        }
        confirmVariant={modalState.type === "suspend" ? "orange" : "green"}
        onConfirm={confirmAction}
        onCancel={() =>
          setModalState({ isOpen: false, type: null, target: null })
        }
      />
    </div>
  );
};

export default RegisteredUniversities;
