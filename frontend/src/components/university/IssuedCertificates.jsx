import React, { useState } from 'react';
import { Eye, Trash2, Search, FileText as FileTextIcon } from 'lucide-react';
import { mockIssuedCertificates } from '../../data/mockData';
import StatusBadge from '../shared/StatusBadge';
import ConfirmModal from '../shared/ConfirmModal';
import CertificateDetailsModal from './CertificateDetailsModal';

const IssuedCertificates = () => {
  const [certificates, setCertificates] = useState(mockIssuedCertificates);
  const [searchHash, setSearchHash] = useState('');
  const [revokeModalState, setRevokeModalState] = useState({ isOpen: false, target: null });
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const filteredCertificates = certificates.filter(cert =>
    cert.hash.toLowerCase().includes(searchHash.toLowerCase()) ||
    cert.studentName.toLowerCase().includes(searchHash.toLowerCase()) ||
    cert.issueDate.toLowerCase().includes(searchHash.toLowerCase())
  );
  const [detailsModalState, setDetailsModalState] = useState({ isOpen: false, target: null });

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const validCerts = filteredCertificates.filter(c => c.status === 'valid');
  const allValidSelected = validCerts.length > 0 && 
    validCerts.every(c => selectedIds.includes(c.id));

  const toggleSelectAll = () => {
    if (allValidSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(validCerts.map(c => c.id));
    }
  };

  const handleBulkRevoke = () => {
    setCertificates(prev => prev.map(c => selectedIds.includes(c.id) ? { ...c, status: 'revoked' } : c));
    setSelectedIds([]);
    setShowBulkConfirm(false);
  };

  const handleRevoke = (cert) => {
    setRevokeModalState({ isOpen: true, target: cert });
  };

  const handleViewDetails = (cert) => {
    setDetailsModalState({ isOpen: true, target: cert });
  };

  const confirmRevoke = () => {
    const { target } = revokeModalState;
    setCertificates(prev => prev.map(c => c.id === target.id ? { ...c, status: 'revoked' } : c));
    setRevokeModalState({ isOpen: false, target: null });
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Issued Certificates</h2>
        <p style={{ color: 'var(--text-secondary)' }}>View and manage certificates issued by your university</p>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '16px'
      }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="text"
            placeholder="Search by name, hash, or date..."
            value={searchHash}
            onChange={(e) => setSearchHash(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '36px' }}
          />
        </div>
        {searchHash && (
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {filteredCertificates.length} result(s) found
          </span>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--primary-light)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500' }}>
            {selectedIds.length} certificate(s) selected
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setSelectedIds([])}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}>
              Clear Selection
            </button>
            <button
              onClick={() => setShowBulkConfirm(true)}
              style={{
                background: 'var(--danger)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '13px',
                color: 'var(--sidebar-text-active)',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
              <Trash2 size={14} /> Revoke Selected ({selectedIds.length})
            </button>
          </div>
        </div>
      )}

      <div className="card" style={{ overflowX: 'auto' }}>
        <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th style={{ width: '48px', padding: '12px 16px' }}>
                <input
                  type="checkbox"
                  checked={allValidSelected}
                  onChange={toggleSelectAll}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
              </th>
              <th>Student Name</th>
              <th>Certificate Hash</th>
              <th>Issue Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCertificates.length === 0 && searchHash ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <Search size={28} color="var(--primary)" />
                    </div>
                    <p className="empty-state-title">No Results Found</p>
                    <p className="empty-state-subtitle">Try searching with a different certificate hash</p>
                  </div>
                </td>
              </tr>
            ) : filteredCertificates.length === 0 ? (
              <tr>
                <td colSpan="6">
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
                <tr key={cert.id}>
                  <td style={{ padding: '12px 16px' }}>
                    {cert.status === 'valid' ? (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(cert.id)}
                        onChange={() => toggleSelect(cert.id)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                    ) : (
                      <span style={{ color: 'var(--separator-muted)', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td className="font-medium">{cert.studentName}</td>
                  <td className="mono text-sm">{cert.hash}</td>
                  <td>{cert.issueDate}</td>
                  <td><StatusBadge status={cert.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '6px 12px' }}
                        onClick={() => handleViewDetails(cert)}
                      >
                        <Eye size={16} /> View Details
                      </button>
                      {cert.status === 'valid' && (
                        <button 
                          className="btn btn-red-outline" 
                          style={{ padding: '6px 12px' }}
                          onClick={() => handleRevoke(cert)}
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

      <ConfirmModal 
        isOpen={revokeModalState.isOpen}
        title="Revoke Certificate"
        message={`Are you sure you want to revoke the certificate for ${revokeModalState.target?.studentName}? This will mark the certificate as revoked on the blockchain and cannot be undone. The certificate will still be visible but will show as revoked during verification.`}
        confirmLabel="Revoke Certificate"
        confirmVariant="red"
        onConfirm={confirmRevoke}
        onCancel={() => setRevokeModalState({ isOpen: false, target: null })}
      />

      <ConfirmModal
        isOpen={showBulkConfirm}
        title="Revoke Selected Certificates"
        message={`Are you sure you want to revoke ${selectedIds.length} certificate(s)? This will mark them as revoked on the blockchain and cannot be undone.`}
        confirmLabel="Revoke All"
        confirmVariant="red"
        onConfirm={handleBulkRevoke}
        onCancel={() => setShowBulkConfirm(false)}
      />

      <CertificateDetailsModal 
        isOpen={detailsModalState.isOpen}
        cert={detailsModalState.target}
        onClose={() => setDetailsModalState({ isOpen: false, target: null })}
      />

    </div>
  );
};

export default IssuedCertificates;
