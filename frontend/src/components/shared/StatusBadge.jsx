import React from 'react';

/**
 * Maps backend status strings to CSS class names.
 * Backend uses Title Case: "Issued", "Revoked", "Pending", "PendingRevocation", "Active", "Suspended"
 */
const STATUS_CLASS_MAP = {
  // Certificate statuses
  issued: "status-valid",
  valid: "status-valid",       // legacy compat
  revoked: "status-revoked",
  pending: "status-revoked",   // pending = yellow/warning
  pendingrevocation: "status-suspended",

  // University statuses
  active: "status-active",
  approved: "status-active",     // legacy DB records before rename to Active
  suspended: "status-suspended",
  rejected: "status-invalid",

  // Fallback
  invalid: "status-invalid",
  fake: "status-invalid",
};

/** Human-readable labels for non-obvious statuses */
const STATUS_LABEL_MAP = {
  pendingrevocation: "Revoking…",
  fake: "Invalid",
};

const StatusBadge = ({ status }) => {
  const normalizedStatus = (status || '').toLowerCase().replace(/[^a-z]/g, '');
  const badgeClass = STATUS_CLASS_MAP[normalizedStatus] || STATUS_CLASS_MAP.invalid;
  const displayLabel = STATUS_LABEL_MAP[normalizedStatus] || status;

  return (
    <span 
      className={badgeClass}
      style={{
        display: 'inline-block',
        fontSize: '12px',
        padding: '2px 10px',
        borderRadius: '9999px',
        fontWeight: '500',
        textTransform: 'capitalize'
      }}
    >
      {displayLabel}
    </span>
  );
};

export default StatusBadge;
