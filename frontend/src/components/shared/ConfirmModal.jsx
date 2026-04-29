import React, { useEffect } from "react";

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel,
  confirmVariant,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  let btnClass = "btn-primary";
  if (confirmVariant === "red") btnClass = "btn-red-outline btn-outline";
  if (confirmVariant === "green") btnClass = "btn-green";
  if (confirmVariant === "orange") btnClass = "btn-orange";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onCancel}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "24px",
          boxShadow: "var(--shadow-modal)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginBottom: "12px", fontSize: "18px" }}>{title}</h3>
        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "24px",
            fontSize: "14px",
          }}
        >
          {message}
        </p>
        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}
        >
          <button className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`btn ${btnClass}`}
            onClick={onConfirm}
            style={
              confirmVariant === "red"
                ? { backgroundColor: "#DC2626", color: "white", border: "none" }
                : {}
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
