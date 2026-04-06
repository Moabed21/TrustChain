import React from 'react';

const StatusBadge = ({ status }) => {
  const StatusStyles = {
    valid: "status-valid",
    active: "status-active",
    revoked: "status-revoked",
    invalid: "status-invalid",
    suspended: "status-suspended",
  };

  const badgeClass = StatusStyles[status] || StatusStyles.invalid;

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
      {status}
    </span>
  );
};

export default StatusBadge;
