import React, { useState } from 'react';
import { Ban, Play, Search } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import ConfirmModal from '../shared/ConfirmModal';

const RegisteredUniversities = () => {

  const [universities, setUniversities] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, type: null, target: null });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUniversities = universities.filter(uni =>
    uni.university_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    uni.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    uni.register_date.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleStatus = (uni, action) => {
    setModalState({ isOpen: true, type: action, target: uni });
  };

  const confirmAction = () => {
    const { type, target } = modalState;
    if (type === 'suspend') {
      setUniversities(prev => prev.map(uni => uni._id === target.id ? { ...uni, status: 'suspended' } : uni));
    } else if (type === 'reactivate') {
      setUniversities(prev => prev.map(uni => uni._id === target.id ? { ...uni, status: 'active' } : uni));
    }
    setModalState({ isOpen: false, type: null, target: null });
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Registered Universities</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Manage universities registered in the system</p>
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
            placeholder="Search by name, country, or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '36px' }}
          />
        </div>
        {searchQuery && (
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {filteredUniversities.length} result(s) found
          </span>
        )}
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>University Name</th>
                <th>Country</th>
                <th>Status</th>
                <th>Registered Date</th>
                <th>Certificates Issued</th>
                <th>Wallet Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUniversities.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Search size={28} color="var(--primary)" />
                      </div>
                      <p className="empty-state-title">No Results Found</p>
                      <p className="empty-state-subtitle">Try adjusting your search query</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUniversities.map((uni) => (
                  <tr key={uni._id}>
                    <td className="font-medium">{uni.university_name}</td>
                    <td>{uni.country}</td>
                    <td><StatusBadge status={uni.status} /></td>
                    <td>{uni.register_date}</td>
                    <td>{uni.total_certificates}</td>
                    <td className="mono text-sm">{uni.wallet}</td>
                    <td>
                      {uni.status === 'active' ? (
                        <button
                          className="btn btn-orange"
                          style={{ padding: '6px 12px' }}
                          onClick={() => handleToggleStatus(uni, 'suspend')}
                        >
                          <Ban size={16} /> Suspend
                        </button>
                      ) : (
                        <button
                          className="btn btn-green"
                          style={{ padding: '6px 12px' }}
                          onClick={() => handleToggleStatus(uni, 'reactivate')}
                        >
                          <Play size={16} /> Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={modalState.isOpen}
        title={modalState.type === 'suspend' ? 'Suspend University' : 'Reactivate University'}
        message={modalState.type === 'suspend'
          ? `Are you sure you want to suspend ${modalState.target?.name}? They will no longer be able to issue new certificates until reactivated.`
          : `Are you sure you want to reactivate ${modalState.target?.name}? They will be able to issue certificates again.`
        }
        confirmLabel={modalState.type === 'suspend' ? 'Suspend' : 'Reactivate'}
        confirmVariant={modalState.type === 'suspend' ? 'orange' : 'green'}
        onConfirm={confirmAction}
        onCancel={() => setModalState({ isOpen: false, type: null, target: null })}
      />
    </div>
  );
};

export default RegisteredUniversities;
