import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, ClipboardList } from "lucide-react";
import ConfirmModal from "../shared/ConfirmModal";
import {
  getPendingApplicationsAPI,
  approveApplicationAPI,
  rejectApplicationAPI,
} from "../../services/api";

const PendingApplications = () => {
  const [applications, setApplications] = useState([]); // list of pending applications from backend
  const [loading, setLoading] = useState(true); // true while the first fetch is in progress
  const [error, setError] = useState(""); // error message if fetch fails
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null, // "approve" or "reject"
    target: null, // the application object the admin clicked on
  });

  // fetch pending applications from backend on mount
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await getPendingApplicationsAPI();
        setApplications(data);
      } catch (err) {
        setError("Failed to load applications. Please refresh the page.");
        console.error("getPendingApplicationsAPI failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []); // empty array  runs once when the component mounts

  const handleApprove = (app) => {
    // open the confirm modal in approve mode for this application
    setModalState({ isOpen: true, type: "approve", target: app });
  };

  const handleReject = (app) => {
    // open the confirm modal in reject mode for this application
    setModalState({ isOpen: true, type: "reject", target: app });
  };

  const confirmAction = async () => {
    const { type, target } = modalState;
    try {
      if (type === "approve") {
        await approveApplicationAPI(target._id);
        // backend sets university status to "Active" and creates their login account
      } else if (type === "reject") {
        await rejectApplicationAPI(target._id);
        // backend sets university status to "Rejected"
      }
      // remove from local list only after backend confirms success
      setApplications((prev) => prev.filter((app) => app._id !== target._id));
    } catch (err) {
      console.error("Action failed:", err);
    }
    setModalState({ isOpen: false, type: null, target: null });
  };

  // loading state  shown while the first fetch is in progress
  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>
            Pending Applications
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Review and approve university registration requests
          </p>
        </div>
        <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
      </div>
    );
  }

  // error state  shown if the fetch failed
  if (error) {
    return (
      <div>
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>
            Pending Applications
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Review and approve university registration requests
          </p>
        </div>
        <p style={{ color: "var(--danger)" }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>
          Pending Applications
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Review and approve university registration requests
        </p>
      </div>

      {/* empty state  shown after fetch completes with zero results */}
      {applications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <ClipboardList size={28} color="var(--primary)" />
          </div>
          <p className="empty-state-title">No Pending Applications</p>
          <p className="empty-state-subtitle">
            All applications have been reviewed
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflowX: "auto" }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>University Name</th>
                  <th>Country</th>
                  <th>Email</th>
                  <th>Request Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td className="font-medium">{app.university_name}</td>
                    <td>{app.country}</td>
                    <td>{app.email}</td>
                    <td>{new Date(app.register_date).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="btn btn-green"
                          style={{ padding: "6px 12px" }}
                          onClick={() => handleApprove(app)}
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button
                          className="btn btn-red-outline"
                          style={{ padding: "6px 12px" }}
                          onClick={() => handleReject(app)}
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* confirm modal  shown when admin clicks approve or reject */}
      <ConfirmModal
        isOpen={modalState.isOpen}
        title={
          modalState.type === "approve"
            ? "Approve Application"
            : "Reject Application"
        }
        message={
          modalState.type === "approve"
            ? `Are you sure you want to approve the registration for ${modalState.target?.university_name}? They will be granted access to issue certificates.`
            : `Are you sure you want to reject the registration for ${modalState.target?.university_name}? This action cannot be undone.`
        }
        confirmLabel={modalState.type === "approve" ? "Approve" : "Reject"}
        confirmVariant={modalState.type === "approve" ? "green" : "red"}
        onConfirm={confirmAction}
        onCancel={() =>
          setModalState({ isOpen: false, type: null, target: null })
        }
      />
    </div>
  );
};

export default PendingApplications;
