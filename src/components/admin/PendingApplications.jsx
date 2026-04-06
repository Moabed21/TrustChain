import React, { useState } from 'react';
import { CheckCircle, XCircle, ClipboardList } from 'lucide-react';
import { mockPendingApplications } from '../../data/mockData';
import ConfirmModal from '../shared/ConfirmModal';

const PendingApplications = () => {
  const [applications, setApplications] = useState([...mockPendingApplications]);
  const [modalState, setModalState] = useState({ isOpen: false, type: null, target: null });

  const handleApprove = (app) => {
    setModalState({ isOpen: true, type: 'approve', target: app });
  };

  const handleReject = (app) => {
    setModalState({ isOpen: true, type: 'reject', target: app });
  };

  const confirmAction = () => {
    const { type, target } = modalState;
    if (type === 'approve' || type === 'reject') {
      setApplications(prev => prev.filter(app => app.id !== target.id));
    }
    setModalState({ isOpen: false, type: null, target: null });
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Pending Applications</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Review and approve university registration requests</p>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <ClipboardList size={28} color="var(--primary)" />
          </div>
          <p className="empty-state-title">No Pending Applications</p>
          <p className="empty-state-subtitle">All applications have been reviewed</p>
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>University Name</th>
                <th>Country</th>
                <th>Email</th>
                <th>Wallet Address</th>
                <th>Request Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td className="font-medium">{app.name}</td>
                  <td>{app.country}</td>
                  <td>{app.email}</td>
                  <td className="mono text-sm">{app.wallet}</td>
                  <td>{app.requestDate}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-green" 
                        style={{ padding: '6px 12px' }}
                        onClick={() => handleApprove(app)}
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button 
                        className="btn btn-red-outline" 
                        style={{ padding: '6px 12px' }}
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
      )}

      <ConfirmModal 
        isOpen={modalState.isOpen}
        title={modalState.type === 'approve' ? 'Approve Application' : 'Reject Application'}
        message={modalState.type === 'approve' 
          ? `Are you sure you want to approve the registration for ${modalState.target?.name}? They will be granted access to issue certificates.`
          : `Are you sure you want to reject the registration for ${modalState.target?.name}? This action cannot be undone.`
        }
        confirmLabel={modalState.type === 'approve' ? 'Approve' : 'Reject'}
        confirmVariant={modalState.type === 'approve' ? 'green' : 'red'}
        onConfirm={confirmAction}
        onCancel={() => setModalState({ isOpen: false, type: null, target: null })}
      />
    </div>
  );
};

export default PendingApplications;
