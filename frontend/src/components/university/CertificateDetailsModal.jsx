import React from 'react';
import StatusBadge from '../shared/StatusBadge';

const CertificateDetailsModal = ({ isOpen, cert, onClose }) => {
  if (!isOpen || !cert) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        className="card"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '32px',
          boxShadow: 'var(--shadow-modal)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>Certificate Details</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Complete information about this certificate</p>
        </div>

        <div style={{ display: 'grid', gap: '12px', marginBottom: '32px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '12px' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Student Name</div>
              <div style={{ fontWeight: '500' }}>{cert.studentName}</div>
            </div>
            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Status</div>
              <div><StatusBadge status={cert.status} /></div>
            </div>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Degree Title</div>
            <div style={{ fontWeight: '500' }}>{cert.degreeTitle}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '12px' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Graduation Date</div>
              <div style={{ fontWeight: '500' }}>{cert.graduationDate}</div>
            </div>
            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Issue Date</div>
              <div style={{ fontWeight: '500' }}>{cert.issueDate}</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Certificate Hash</div>
            <div className="mono" style={{ fontWeight: '500' }}>{cert.hash}</div>
          </div>
          
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-outline">
            Download Certificate
          </button>
          <button className="btn btn-outline">
            View on Blockchain
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateDetailsModal;
