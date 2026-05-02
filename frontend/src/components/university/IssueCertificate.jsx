// IssueCertificate.jsx
// two-step certificate issuance flow:
//   step 1 — POST /api/certificates/issue
//            backend: hashes PDF, encrypts, uploads to IPFS, saves status=Pending
//            returns: certificate_id, cert_hash_bytes, encrypted_cid, qr_code
//   step 2 — frontend signs issueCertificate(cert_hash_bytes, encrypted_cid) on-chain
//            using the university wallet from useWallet()
//            waits for tx to be mined
//   step 3 — POST /api/certificates/{id}/confirm  { tx_hash }
//            backend: verifies receipt on-chain, checks from == university wallet, sets status=Issued
//
// the private key never leaves the browser — wallet is decrypted from keystore at login

import React, { useState } from "react";
import { ethers } from "ethers";                          // to connect wallet to provider and call the contract
import { UploadCloud, CheckCircle2, Loader2 } from "lucide-react";
import { useWallet } from "../../context/WalletContext";  // decrypted wallet held in memory since login
import { createCertificateAPI, confirmCertificateAPI } from "../../services/api";
import TrustChainABI from "../../contracts/TrustChain_ABI.json"; // contract function signatures

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS; // deployed contract on Polygon Amoy
const RPC_URL = import.meta.env.VITE_POLYGON_RPC_URL;           // Polygon Amoy RPC endpoint

// issuance has multiple async stages — we show the user which stage is active
const STAGES = {
  IDLE: "idle",
  PREPARING: "preparing",     // calling POST /api/certificates/issue
  SIGNING: "signing",         // wallet signing and broadcasting tx on-chain
  CONFIRMING: "confirming",   // calling POST /api/certificates/{id}/confirm
  DONE: "done",
};

const IssueCertificate = () => {
  const { wallet } = useWallet();
  // wallet is the decrypted ethers.Wallet object from login
  // null if university hasn't set up wallet or session expired

  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    student_name: "",
    major: "",
    graduation_date: "",
  });
  const [stage, setStage] = useState(STAGES.IDLE); // current issuance stage
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);       // success response after confirmation

  const validateFile = (selectedFile) => {
    setError("");
    if (selectedFile.type !== "application/pdf" || selectedFile.size > 5 * 1024 * 1024) {
      setError("Please upload a valid PDF document under 5MB.");
      setFile(null);
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      if (validateFile(e.target.files[0])) setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (validateFile(e.dataTransfer.files[0])) setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!file) {
      setError("Please upload a certificate PDF.");
      return;
    }

    // block issuance if wallet is not available
    // without the wallet we cannot sign the blockchain tx
    // if we let it proceed, backend would save a Pending cert that can never be confirmed
    if (!wallet) {
      setError("Wallet session expired. Please log out and log in again to restore signing access.");
      return;
    }

    try {
      // step 1 — send PDF and form data to backend
      // backend hashes PDF, encrypts, uploads to IPFS, saves cert with status=Pending
      // returns certificate_id, cert_hash_bytes (0x hex), encrypted_cid, qr_code
      setStage(STAGES.PREPARING);
      const prepared = await createCertificateAPI({
        student_name: formData.student_name,
        major: formData.major,
        graduation_date: formData.graduation_date,
        pdf: file,
      });

      // step 2 — sign and broadcast the transaction on-chain
      // wallet from keystore has no provider attached — connect it to Polygon Amoy RPC first
      // without a provider the wallet cannot read nonce, estimate gas, or broadcast
      setStage(STAGES.SIGNING);
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const connectedWallet = wallet.connect(provider);
      // connectedWallet is now able to sign AND broadcast transactions

      const contract = new ethers.Contract(CONTRACT_ADDRESS, TrustChainABI, connectedWallet);
      // issueCertificate(bytes32 certHash, string encryptedCID)
      // cert_hash_bytes is already 0x-prefixed hex — ethers.js accepts this directly as bytes32
      const tx = await contract.issueCertificate(prepared.cert_hash_bytes, prepared.encrypted_cid);
      await tx.wait();
      // wait for the tx to be mined before calling /confirm
      // backend's verify_transaction_receipt will fail if tx is not yet on-chain

      // step 3 — send tx_hash to backend for verification and finalization
      // backend fetches receipt, checks receipt.from == university wallet, sets status=Issued
      setStage(STAGES.CONFIRMING);
      const confirmed = await confirmCertificateAPI(prepared.certificate_id, tx.hash);

      setResult({
        ...confirmed,
        qr_code: prepared.qr_code, // qr_code comes from /issue response, not /confirm
      });
      setStage(STAGES.DONE);

      // reset form for next issuance
      setFormData({ student_name: "", major: "", graduation_date: "" });
      setFile(null);

    } catch (err) {
      // extract FastAPI detail error or ethers.js error message
      const detail = err.response?.data?.detail;
      const message = typeof detail === "object" ? detail.message : detail;
      setError(message || err.message || "Certificate issuance failed. Please try again.");
      setStage(STAGES.IDLE);
    }
  };

  // label shown in submit button and progress banner during each stage
  const stageLabel = {
    [STAGES.PREPARING]: "Preparing certificate...",
    [STAGES.SIGNING]: "Signing transaction...",
    [STAGES.CONFIRMING]: "Confirming on blockchain...",
  };

  const isRunning = stage !== STAGES.IDLE && stage !== STAGES.DONE;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: "640px", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>Issue Certificate</h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Issue a new academic certificate on the blockchain
        </p>
      </div>

      <div className="card" style={{ width: "100%", maxWidth: "640px", padding: "32px" }}>

        {/* success state — shown after all three steps complete */}
        {stage === STAGES.DONE && result && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "14px 16px", background: "var(--valid-bg)",
              border: "1px solid var(--valid-border)", borderRadius: "8px", marginBottom: "16px",
            }}>
              <CheckCircle2 size={20} color="var(--success)" />
              <span style={{ color: "var(--valid-text)", fontWeight: "600", fontSize: "14px" }}>
                Certificate issued successfully on the blockchain!
              </span>
            </div>

            {/* QR code returned from backend — to be printed on the physical certificate */}
            {result.qr_code && (
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                  QR Code — print this on the physical certificate
                </p>
                <img
                  src={`data:image/png;base64,${result.qr_code}`}
                  alt="Certificate QR Code"
                  style={{
                    width: "200px", height: "200px",
                    border: "1px solid var(--border)", borderRadius: "8px",
                  }}
                />
              </div>
            )}

            <button
              className="btn btn-outline w-full"
              onClick={() => { setStage(STAGES.IDLE); setResult(null); }}
            >
              Issue Another Certificate
            </button>
          </div>
        )}

        {/* error banner */}
        {error && (
          <div style={{
            padding: "12px 16px", backgroundColor: "var(--invalid-badge-bg)",
            color: "var(--danger)", borderRadius: "8px", marginBottom: "24px", fontSize: "14px",
          }}>
            {error}
          </div>
        )}

        {/* form — hidden after success */}
        {stage !== STAGES.DONE && (
          <form onSubmit={handleSubmit}>

            {/* PDF upload drop zone */}
            <div
              style={{
                border: "2px dashed var(--border)", borderRadius: "8px",
                padding: "40px", textAlign: "center", cursor: "pointer", marginBottom: "24px",
                backgroundColor: file ? "var(--primary-light)" : "transparent",
                borderColor: file ? "var(--primary)" : "var(--border)",
              }}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById("file-upload").click()}
            >
              <input
                id="file-upload" type="file" accept="application/pdf"
                style={{ display: "none" }} onChange={handleFileChange}
              />
              <UploadCloud
                color={file ? "var(--primary)" : "var(--text-muted)"}
                size={40} style={{ margin: "0 auto", marginBottom: "12px" }}
              />
              {file ? (
                <div style={{ fontWeight: "500", color: "var(--primary)" }}>{file.name}</div>
              ) : (
                <>
                  <div style={{ fontWeight: "500", marginBottom: "4px" }}>Click to upload certificate PDF</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "8px" }}>or drag and drop</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>Accepts .pdf only, max 5MB</div>
                </>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Student Name</label>
              <input
                type="text" className="form-input" name="student_name"
                value={formData.student_name} onChange={handleChange} required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Degree Title</label>
              <input
                type="text" className="form-input" name="major"
                value={formData.major} onChange={handleChange}
                placeholder="e.g., Bachelor of Science in Computer Science" required
              />
            </div>

            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label className="form-label">Graduation Date</label>
              <input
                type="date" name="graduation_date"
                value={formData.graduation_date} onChange={handleChange} required
                style={{
                  height: "40px", padding: "0 12px",
                  border: "1.5px solid var(--border)", borderRadius: "8px",
                  fontSize: "14px", color: "var(--text-primary)",
                  background: "var(--bg-card)", outline: "none", width: "100%",
                }}
              />
            </div>

            {/* stage progress banner — shown while issuance is running */}
            {isRunning && (
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "12px 16px", background: "var(--primary-light)",
                borderRadius: "8px", marginBottom: "16px",
                fontSize: "14px", color: "var(--text-primary)",
              }}>
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
                {stageLabel[stage]}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={isRunning}>
              {isRunning ? stageLabel[stage] : "Issue Certificate"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default IssueCertificate;
