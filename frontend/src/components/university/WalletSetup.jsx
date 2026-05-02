import React, { useState } from "react";
import { ethers } from "ethers"; // wallet generation, keystore encryption, and blockchain tx signing
import {
  Wallet,
  Shield,
  Fuel,
  Link2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
} from "lucide-react"; // icons for the step progress UI
import { registerWalletAPI } from "../../services/api"; // calls PUT /api/universities/me/wallet
import { useAuth } from "../../context/AuthContext"; // gives us refreshUser() to update JWT after wallet is registered

// steps shown to the user during setup, each maps to a setCurrentStep(i) call in handleSetupWallet
const STEPS = [
  {
    icon: Wallet,
    label: "Generating Wallet",
    desc: "Creating a secure blockchain wallet",
  },
  {
    icon: Lock,
    label: "Encrypting Keys",
    desc: "Encrypting private key with your password (may take ~5s)",
    // wallet.encrypt() runs scrypt internally  intentionally slow so brute-forcing the keystore is infeasible
  },
  {
    icon: Link2,
    label: "Registering On-Chain",
    desc: "Sending wallet address to backend for blockchain registration",
  },
  {
    icon: Fuel,
    label: "Funding Wallet",
    desc: "Backend is funding your wallet with gas fees",
  },
  {
    icon: Shield,
    label: "Finalizing",
    desc: "Completing setup",
  },
];

const WalletSetup = ({ password, onComplete }) => {
  const { refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(-1); // -1 means not started yet, button is visible
  const [error, setError] = useState(""); // error message shown in the banner
  const [result, setResult] = useState(null); // success response from registerWalletAPI
  const [manualPassword, setManualPassword] = useState("");
  const effectivePassword = password || manualPassword;

  const handleSetupWallet = async () => {
    setError(""); // clear any previous error before retrying
    setResult(null);

    // fallback to manual password if in-memory password was lost.
    if (!effectivePassword) {
      setError("Enter your password to continue wallet setup.");
      return;
    }

    try {
      // step 0  generate a random wallet
      // createRandom() uses window.crypto internally for secure randomness
      // the wallet object holds the private key in memory only  nothing is stored yet
      setCurrentStep(0);
      const wallet = ethers.Wallet.createRandom();

      // step 1  encrypt the private key into a Keystore V3 JSON
      // wallet.encrypt(effectivePassword) runs: scrypt(password, salt) -> derived key -> AES-128-CTR(privateKey) + HMAC-SHA256 mac
      // scrypt is slow (3-5s) to make brute-forcing the stored keystore computationally infeasible
      setCurrentStep(1);
      const keystoreJson = await wallet.encrypt(effectivePassword);

      // store only the encrypted keystore  the raw private key is never written to localStorage
      // the wallet address is not stored separately because it is always derivable from the keystore after decryption
      localStorage.setItem("trustchain_keystore", keystoreJson);

      // step 2  brief pause so the user sees the step transition before the API call
      setCurrentStep(2);
      await new Promise((r) => setTimeout(r, 400));

      // step 3  register wallet address with backend
      // we send only the PUBLIC wallet address  the server never sees the private key
      // backend will: save address to MongoDB, call registerUniversity() on the smart contract, fund wallet with 0.01 MATIC
      setCurrentStep(3);
      const data = await registerWalletAPI(wallet.address);

      // step 4  finalize
      setCurrentStep(4);
      await new Promise((r) => setTimeout(r, 500));

      setResult(data); // data contains: wallet_address, funded (bool), registered_on_chain (bool)

      // refresh JWT user context so wallet_address is no longer null in the decoded token
      // this unblocks the certificate issuance flow on the dashboard
      await refreshUser();

      // give the user 3 seconds to read the success state before the parent redirects
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 3000);
    } catch (err) {
      // detail can be a string or an object with a message field depending on the FastAPI error shape
      const detail = err.response?.data?.detail;
      const message = typeof detail === "object" ? detail.message : detail;
      setError(message || "Wallet setup failed. Please try again.");
      setCurrentStep(-1); // reset to idle so the button reappears and the user can retry
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        padding: "32px",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "560px",
          padding: "40px",
          textAlign: "center",
        }}
      >
        {/* header icon */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "16px",
            background: "var(--primary-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <Shield size={36} color="var(--primary)" />
        </div>

        <h2
          style={{
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "8px",
            fontFamily: "'Exo 2', sans-serif",
          }}
        >
          Blockchain Wallet Setup
        </h2>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "14px",
            marginBottom: "32px",
            lineHeight: "1.6",
          }}
        >
          A secure wallet is required to issue and verify certificates on the
          blockchain. It will be generated and encrypted automatically no
          external tools needed.
        </p>

        {/* error banner  only shown when an error occurred */}
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 16px",
              background: "var(--invalid-bg)",
              border: "1px solid var(--invalid-border)",
              borderRadius: "8px",
              marginBottom: "24px",
              textAlign: "left",
            }}
          >
            <AlertCircle
              size={18}
              color="var(--danger)"
              style={{ flexShrink: 0 }}
            />
            <span style={{ color: "var(--danger)", fontSize: "13px" }}>
              {error}
            </span>
          </div>
        )}

        {/* step progress  shown while setup is running, hidden after success */}
        {currentStep >= 0 && !result && (
          <div style={{ marginBottom: "28px", textAlign: "left" }}>
            {STEPS.map((step, i) => {
              const StepIcon = step.icon;
              const isActive = i === currentStep; // currently running
              const isDone = i < currentStep; // already completed

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    marginBottom: "4px",
                    background: isActive
                      ? "var(--primary-light)"
                      : "transparent",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isDone
                        ? "var(--valid-badge-bg)"
                        : isActive
                          ? "var(--primary)"
                          : "var(--bg-app)",
                      flexShrink: 0,
                      transition: "all 0.3s ease",
                    }}
                  >
                    {isDone ? (
                      // completed step  green checkmark
                      <CheckCircle2 size={18} color="var(--success)" />
                    ) : isActive ? (
                      // active step  spinning loader
                      <Loader2
                        size={18}
                        color="white"
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : (
                      // future step  dimmed icon
                      <StepIcon size={18} color="var(--text-muted)" />
                    )}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: isActive ? "600" : "500",
                        color: isDone
                          ? "var(--success)"
                          : isActive
                            ? "var(--text-primary)"
                            : "var(--text-muted)",
                      }}
                    >
                      {step.label}
                    </div>
                    {/* description only shown for the currently active step */}
                    {isActive && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                          marginTop: "2px",
                        }}
                      >
                        {step.desc}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* success state  shown after all steps complete */}
        {result && (
          <div style={{ marginBottom: "24px", textAlign: "left" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 16px",
                background: "var(--valid-bg)",
                border: "1px solid var(--valid-border)",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              <CheckCircle2 size={20} color="var(--success)" />
              <span
                style={{
                  color: "var(--valid-text)",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Wallet setup complete!
              </span>
            </div>

            <div
              style={{
                padding: "16px",
                background: "var(--bg-app)",
                borderRadius: "8px",
                fontSize: "13px",
              }}
            >
              {/* wallet address returned by the backend */}
              <div style={{ marginBottom: "10px" }}>
                <span style={{ color: "var(--text-secondary)" }}>
                  Wallet Address
                </span>
                <div
                  className="mono"
                  style={{
                    color: "var(--text-primary)",
                    fontSize: "12px",
                    marginTop: "4px",
                    wordBreak: "break-all",
                  }}
                >
                  {result.wallet_address}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                {/* funded badge  backend sends 0.01 MATIC via funding.py */}
                <div
                  style={{
                    padding: "10px",
                    background: result.funded
                      ? "var(--valid-badge-bg)"
                      : "var(--revoked-badge-bg)",
                    borderRadius: "6px",
                    textAlign: "center",
                  }}
                >
                  <Fuel
                    size={16}
                    color={result.funded ? "var(--success)" : "var(--warning)"}
                    style={{ margin: "0 auto 4px", display: "block" }}
                  />
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: result.funded
                        ? "var(--success)"
                        : "var(--warning)",
                    }}
                  >
                    {result.funded ? "Funded ✓" : "Funding Pending"}
                  </div>
                </div>

                {/* on-chain badge  backend called registerUniversity() on the smart contract */}
                <div
                  style={{
                    padding: "10px",
                    background: result.registered_on_chain
                      ? "var(--valid-badge-bg)"
                      : "var(--revoked-badge-bg)",
                    borderRadius: "6px",
                    textAlign: "center",
                  }}
                >
                  <Link2
                    size={16}
                    color={
                      result.registered_on_chain
                        ? "var(--success)"
                        : "var(--warning)"
                    }
                    style={{ margin: "0 auto 4px", display: "block" }}
                  />
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: result.registered_on_chain
                        ? "var(--success)"
                        : "var(--warning)",
                    }}
                  >
                    {result.registered_on_chain
                      ? "On-Chain ✓"
                      : "Registration Pending"}
                  </div>
                </div>
              </div>

              {/* encryption confirmation  confirms the private key was never stored raw */}
              <div
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  background: "var(--valid-badge-bg)",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <Lock size={14} color="var(--success)" />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "var(--success)",
                  }}
                >
                  Private key encrypted in browser ✓
                </span>
              </div>
            </div>

            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "12px",
                marginTop: "12px",
                textAlign: "center",
              }}
            >
              Redirecting to dashboard...
            </p>
          </div>
        )}

        {/* action button  only shown before setup starts or after an error so user can retry */}
        {currentStep === -1 && (
          <>
            {!password && (
              <div className="form-group" style={{ textAlign: "left", marginBottom: "14px" }}>
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={manualPassword}
                  onChange={(e) => setManualPassword(e.target.value)}
                  placeholder="Enter your login password"
                  autoComplete="current-password"
                  required
                />
              </div>
            )}
            <button
              className="btn btn-primary w-full"
              onClick={handleSetupWallet}
              style={{ padding: "14px", fontSize: "15px", fontWeight: "600" }}
            >
              <Wallet size={18} />
              Setup Blockchain Wallet
            </button>
          </>
        )}

        {/* info notice  explains what will happen before the user clicks */}
        {currentStep === -1 && (
          <div
            style={{
              marginTop: "20px",
              padding: "12px 16px",
              background: "var(--primary-light)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "var(--text-secondary)",
              lineHeight: "1.6",
            }}
          >
            <strong>What happens:</strong> A unique wallet is generated and its
            private key is encrypted with your login password before being
            stored locally. Only your public address is sent to the server your
            private key never leaves your browser.
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletSetup;
