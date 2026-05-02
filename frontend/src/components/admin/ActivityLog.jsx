import React, { useState } from 'react';
import { CheckCircle2, XCircle, Ban, AlertCircle, Search } from 'lucide-react';


const getActionIcon = (action) => {
  switch (action) {
    case 'approved': return <CheckCircle2 size={16} color="var(--success)" />;
    case 'rejected': return <XCircle size={16} color="var(--danger)" />;
    case 'suspended': return <Ban size={16} color="var(--warning)" />;
    case 'revoked': return <AlertCircle size={16} color="var(--warning)" />;
    default: return null;
  }
};

const getActionBadge = (action) => {
  const styles = {
    approved: { background: 'var(--valid-badge-bg)', color: 'var(--valid-badge-text)' },
    rejected: { background: 'var(--invalid-badge-bg)', color: 'var(--danger)' },
    suspended: { background: 'var(--revoked-badge-bg)', color: 'var(--revoked-badge-text)' },
    revoked: { background: 'var(--revoked-badge-bg)', color: 'var(--revoked-badge-text)' },
  };
  const style = styles[action] || {};
  return (
    <span style={{
      ...style,
      padding: '3px 10px',
      borderRadius: '999px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'capitalize'
    }}>
      {action}
    </span>
  );
};

const ActivityLog = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filtered = mockActivityLog.filter(item => {
    const matchesSearch = item.target.toLowerCase().includes(search.toLowerCase()) ||
      item.action.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Activity Log</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Complete history of all administrative actions</p>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap'
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
            placeholder="Search activity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '36px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'university', 'certificate'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                border: filterType === type ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                background: filterType === type ? 'var(--primary-light)' : 'transparent',
                color: filterType === type ? 'var(--primary)' : 'var(--text-secondary)',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {type === 'all' ? 'All' : type === 'university' ? 'Universities' : 'Certificates'}
            </button>
          ))}
        </div>

        <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {filtered.length} entries
        </span>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{ width: '48px' }}></th>
                <th>Action</th>
                <th>Target</th>
                <th>Type</th>
                <th>Performed By</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Search size={28} color="var(--primary)" />
                      </div>
                      <p className="empty-state-title">No Activity Found</p>
                      <p className="empty-state-subtitle">Try adjusting your search or filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id}>
                    <td style={{ padding: '12px 16px' }}>
                      {getActionIcon(item.action)}
                    </td>
                    <td>{getActionBadge(item.action)}</td>
                    <td className="font-medium">{item.target}</td>
                    <td>
                      <span style={{
                        textTransform: 'capitalize',
                        fontSize: '13px',
                        color: 'var(--text-secondary)'
                      }}>
                        {item.type}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px' }}>{item.actor}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
