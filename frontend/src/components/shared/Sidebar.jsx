import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClipboardList, Building2, FileText, Archive, LogOut, LayoutDashboard, History } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import logo from '../../assets/logo.png';

const Sidebar = ({ role, isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role: userRole, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavClick = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const navItems = role === 'admin'
    ? [
      { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Pending Applications', path: '/admin/pending', icon: ClipboardList },
      { label: 'Registered Universities', path: '/admin/universities', icon: Building2 },
      { label: 'Activity Log', path: '/admin/activity', icon: History },
    ]
    : [
      { label: 'Dashboard', path: '/university/dashboard', icon: LayoutDashboard },
      { label: 'Issue Certificate', path: '/university/issue', icon: FileText },
      { label: 'Issued Certificates', path: '/university/certificates', icon: Archive },
    ];

  const subtitle = role === 'admin' ? 'Admin Portal' : 'University Portal';

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
    <div
      className={`sidebar ${isOpen ? 'open' : ''}`}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: 'var(--sidebar-w)',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ padding: '24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <img
            src={logo}
            alt="TrustChain"
            style={{
              width: '40px',
              height: '40px',
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: '700', fontSize: '18px', color: 'var(--sidebar-text-active)' }}>TrustChain</span>
        </div>
        <div style={{ color: 'var(--sidebar-text)', fontSize: '12px', paddingLeft: '30px' }}>
          {subtitle}
        </div>
      </div>

      {/* Gold Divider */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
        margin: '16px 0'
      }} />

      {/* User Info */}
      <div style={{
        padding: '0 16px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: '700',
          color: 'var(--sidebar-text-active)',
          flexShrink: 0
        }}>
          {(user?.email || 'U').charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{
            color: 'var(--sidebar-text-active)',
            fontSize: '13px',
            fontWeight: '600',
            lineHeight: '1.2'
          }}>{user?.email?.split('@')[0] || 'User'}</div>
          <div style={{
            color: 'var(--sidebar-text)',
            fontSize: '11px',
            marginTop: '2px'
          }}>{userRole === 'admin' ? 'System Admin' : 'University'}</div>
        </div>
      </div>

      {/* Second Divider */}
      <div style={{
        height: '1px',
        background: 'rgba(255,255,255,0.08)',
        margin: '0 16px 16px'
      }} />

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 16px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);

          return (
            <div
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                ...(isActive ? {
                  backgroundColor: 'var(--sidebar-active-bg)',
                  borderLeft: '3px solid var(--sidebar-active-border)',
                  color: 'var(--sidebar-text-active)',
                  fontWeight: '500'
                } : {
                  color: 'var(--sidebar-text)',
                })
              }}
            >
              <Icon size={18} />
              {item.label}
            </div>
          );
        })}
      </nav>

      <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px' }}>
        <div style={{ padding: '0 8px', marginBottom: '8px' }}>
          <ThemeToggle variant="sidebar" />
        </div>

        <div
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            color: 'var(--sidebar-text)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--sidebar-active-bg)';
            e.currentTarget.style.color = 'var(--sidebar-text-active)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--sidebar-text)';
          }}
        >
          <LogOut size={18} />
          Logout
        </div>
      </div>
    </div>
    </>
  );
};

export default Sidebar;
