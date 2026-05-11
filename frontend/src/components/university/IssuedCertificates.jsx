// IssuedCertificates.jsx
// fetches all certificates issued by this university on mount via listCertificatesAPI
// revocation is a two-step flow:
//   step 1 — PUT /api/certificates/{id}/revoke
//            backend: checks ownership + status=Issued, sets status=PendingRevocation
//            returns: cert_hash_bytes
//   step 2 — frontend signs revokeCertificate(cert_hash_bytes) on-chain using university wallet
//            waits for tx to be mined
//   step 3 — POST /api/certificates/{id}/revoke/confirm  { tx_hash }
//            backend: verifies receipt, checks from == university wallet, sets status=Revoked
//
// bulk revocation is removed — each revocation is a separate blockchain tx requiring a separate signature
// doing them sequentially with nonce ordering is complex and partial failures leave bad state

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Eye, Trash2, Search, FileText as FileTextIcon, Loader2, Download } from "lucide-react";
import { useWallet } from "../../context/WalletContext";  // decrypted wallet for signing revocation tx
import StatusBadge from "../shared/StatusBadge";
import ConfirmModal from "../shared/ConfirmModal";
import CertificateDetailsModal from "./CertificateDetailsModal";
import {
  listCertificatesAPI,
  revokeCertificateAPI,
  confirmRevocationAPI,
  downloadCertificateAPI,
} from "../../services/api";
import TrustChainABI from "../../contracts/TrustChain_ABI.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const RPC_URL = import.meta.env.VITE_POLYGON_RPC_URL;

const IssuedCertificates = () => {
  const { wallet } = useWallet();

  const [certificates, setCertificates] = useState([]);  // list from backend
  const [loading, setLoading] = useState(true);           // true during initial fetch
  const [error, setError] = useState("");
  const [searchHash, setSearchHash] = useState("");
  const [revokeModalState, setRevokeModalState] = useState({ isOpen: false, target: null });
  const [revoking, setRevoking] = useState(false);        // true while revocation steps are running
  const [revokeStage, setRevokeStage] = useState("");     // label shown during revocation
  const [detailsModalState, setDetailsModalState] = useState({ isOpen: false, target: null });
  const [downloading, setDownloading] = useState(null); // certificate _id currently downloading

  // fetch certificates from backend on mount
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const data = await listCertificatesAPI();
        setCertificates(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load certificates. Please refresh the page.");
        console.error("listCertificatesAPI failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []); // runs once on mount

  // filter by student name, hash, or date
  const filteredCertificates = certificates.filter((cert) => {
    const query = searchHash.toLowerCase();
    return (
      (cert.hashed_certificate || "").toLowerCase().includes(query) ||
      (cert.student_name || "").toLowerCase().includes(query) ||
      (cert.issue_date || "").toLowerCase().includes(query)
    );
  });

  const handleRevoke = (cert) => {
    // open confirm modal — actual revocation only starts after admin confirms
    setRevokeModalState({ isOpen: true, target: cert });
  };

  const confirmRevoke = async () => {
    const { target } = revokeModalState;
    setRevokeModalState({ isOpen: false, target: null });

    if (!wallet) {
      setError("Wallet session expired. Please log out and log in again to restore signing access.");
      return;
    }

    setRevoking(true);
    try {
      // step 1 — tell backend to mark cert as PendingRevocation
      // backend checks ownership and that status=Issued, returns cert_hash_bytes
      setRevokeStage("Preparing revocation...");
      const prepared = await revokeCertificateAPI(target._id);

      // step 2 — sign and broadcast revokeCertificate on-chain
      setRevokeStage("Signing transaction...");
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const connectedWallet = wallet.connect(provider);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, TrustChainABI, connectedWallet);
      // revokeCertificate takes bytes32 certHash
      const tx = await contract.revokeCertificate(prepared.cert_hash_bytes);
      await tx.wait();
      // wait for mining before calling /confirm — backend needs the receipt to exist on-chain

      // step 3 — send tx_hash to backend to finalize revocation
      setRevokeStage("Confirming on blockchain...");
      await confirmRevocationAPI(target._id, tx.hash);

      // update local state so UI reflects Revoked immediately without a full refetch
      setCertificates((prev) =>
        prev.map((c) => c._id === target._id ? { ...c, status: "Revoked" } : c)
      );

    } catch (err) {
      const detail = err.response?.data?.detail;
      const message = typeof detail === "object" ? detail.message : detail;
      setError(message || err.message || "Revocation failed. Please try again.");
      // if step 1 succeeded but step 2/3 failed, cert stays as PendingRevocation in MongoDB
      // refetch so UI shows the correct status instead of the old Issued status
      try {
        const data = await listCertificatesAPI();
        setCertificates(Array.isArray(data) ? data : []);
      } catch { /* ignore refetch error */ }
    } finally {
      setRevoking(false);
      setRevokeStage("");
    }
  };

  const handleDownload = async (cert) => {
    setDownloading(cert._id);
    try {
      const blob = await downloadCertificateAPI(cert._id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(cert.student_name || "certificate").replace(/\s+/g, "_")}_certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message = typeof detail === "object" ? detail.message : detail;
      setError(message || "Failed to download certificate. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
        <Loader2 size={32} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>Issued Certificates</h2>
        <p style={{ color: "var(--text-secondary)" }}>
          View and manage certificates issued by your university
        </p>
      </div>

      {/* error banner */}
      {error && (
        <div style={{
          padding: "12px 16px", backgroundColor: "var(--invalid-badge-bg)",
          color: "var(--danger)", borderRadius: "8px", marginBottom: "16px", fontSize: "14px",
        }}>
          {error}
        </div>
      )}

      {/* revocation progress banner — shown while revocation steps are running */}
      {revoking && (
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "12px 16px", background: "var(--primary-light)",
          borderRadius: "8px", marginBottom: "16px",
          fontSize: "14px", color: "var(--text-primary)",
        }}>
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
          {revokeStage}
        </div>
      )}

      {/* search bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <div style={{ position: "relative", width: "300px" }}>
          <Search size={16} style={{
            position: "absolute", left: "12px", top: "50%",
            transform: "translateY(-50%)", color: "var(--text-muted)",
          }} />
          <input
            type="text"
            placeholder="Search by name, hash, or date..."
            value={searchHash}
            onChange={(e) => setSearchHash(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "36px" }}
          />
        </div>
        {searchHash && (
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            {filteredCertificates.length} result(s) found
          </span>
        )}
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Certificate Hash</th>
                <th>Issue Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCertificates.length === 0 && searchHash ? (
                // no results for this search query
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Search size={28} color="var(--primary)" />
                      </div>
                      <p className="empty-state-title">No Results Found</p>
                      <p className="empty-state-subtitle">Try searching with a different term</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCertificates.length === 0 ? (
                // no certificates issued yet
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <FileTextIcon size={28} color="var(--primary)" />
                      </div>
                      <p className="empty-state-title">No Certificates Issued Yet</p>
                      <p className="empty-state-subtitle">Issue your first certificate to see it here</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((cert) => (
                  <tr key={cert._id}>
                    <td className="font-medium">{cert.student_name}</td>
                    <td className="mono text-sm">{cert.hashed_certificate}</td>
                    <td>{new Date(cert.issue_date).toLocaleDateString()}</td>
                    <td><StatusBadge status={cert.status} /></td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: "6px 12px" }}
                          onClick={() => setDetailsModalState({ isOpen: true, target: cert })}
                        >
                          <Eye size={16} /> View Details
                        </button>
                        {/* download button for Issued or Revoked certs — they have valid IPFS data */}
                        {(cert.status === "Issued" || cert.status === "Revoked") && (
                          <button
                            className="btn btn-outline"
                            style={{ padding: "6px 12px" }}
                            onClick={() => handleDownload(cert)}
                            disabled={downloading === cert._id}
                          >
                            {downloading === cert._id ? (
                              <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Downloading...</>
                            ) : (
                              <><Download size={16} /> Download</>  
                            )}
                          </button>
                        )}
                        {/* revoke button only shown for Issued certs — not Pending, PendingRevocation, or Revoked */}
                        {cert.status === "Issued" && (
                          <button
                            className="btn btn-red-outline"
                            style={{ padding: "6px 12px" }}
                            onClick={() => handleRevoke(cert)}
                            disabled={revoking}
                          >
                            <Trash2 size={16} /> Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* revoke confirm modal */}
      <ConfirmModal
        isOpen={revokeModalState.isOpen}
        title="Revoke Certificate"
        message={`Are you sure you want to revoke the certificate for ${revokeModalState.target?.student_name}? This will mark it as revoked on the blockchain and cannot be undone.`}
        confirmLabel="Revoke Certificate"
        confirmVariant="red"
        onConfirm={confirmRevoke}
        onCancel={() => setRevokeModalState({ isOpen: false, target: null })}
      />

      {/* certificate details modal */}
      <CertificateDetailsModal
        isOpen={detailsModalState.isOpen}
        cert={detailsModalState.target}
        onClose={() => setDetailsModalState({ isOpen: false, target: null })}
      />
    </div>
  );
};

export default IssuedCertificates;
