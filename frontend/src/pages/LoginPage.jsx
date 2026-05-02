import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import logo from '../assets/logo.png';
import ThemeToggle from '../components/shared/ThemeToggle';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userRole = await login(email, password);
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/university/dashboard');
      }
    } catch (err) {
      // extract detailed error message from backend
      const detail = err.response?.data?.detail || 'Invalid email or password';
      setError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-split" style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--bg-app)'
    }}>
      <div className="login-left" style={{
        width: '40%',
        background: 'var(--hero-card)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Geometric circles top-right */}
        <svg style={{
          position: 'absolute', top: '-60px', right: '-60px', opacity: 0.06
        }} width="300" height="300" viewBox="0 0 300 300">
          <circle cx="150" cy="150" r="140" fill="none" stroke="white" strokeWidth="1" />
          <circle cx="150" cy="150" r="110" fill="none" stroke="white" strokeWidth="1" />
          <circle cx="150" cy="150" r="80" fill="none" stroke="white" strokeWidth="1" />
          <circle cx="150" cy="150" r="50" fill="none" stroke="white" strokeWidth="1" />
        </svg>

        {/* Geometric circles bottom-left */}
        <svg style={{
          position: 'absolute', bottom: '-40px', left: '-40px', opacity: 0.06
        }} width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="white" strokeWidth="1" />
          <circle cx="100" cy="100" r="65" fill="none" stroke="white" strokeWidth="1" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="1" />
        </svg>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0px',
          position: 'relative',
          zIndex: 1,
          marginBottom: '20px'
        }}>
          <img
            src={logo}
            alt="TrustChain"
            style={{
              width: '120px',
              height: '120px',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto 12px'
            }}
          />
          <h3 style={{
            color: 'var(--hero-text)',
            fontSize: '24px',
            fontWeight: '700',
            textAlign: 'center',
            margin: '0'
          }}>TrustChain</h3>
          <div style={{
            width: '40px',
            height: '3px',
            background: 'var(--accent)',
            borderRadius: '2px',
            marginTop: '12px'
          }} />
        </div>

        {[
          'Tamper-proof certificate storage',
          'Instant verification worldwide',
          'Trusted by top universities',
        ].map((text) => (
          <div key={text} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '8px',
            width: '100%',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: 'var(--accent)',
              flexShrink: 0
            }} />
            <span style={{ color: 'var(--label-muted)', fontSize: '13px' }}>{text}</span>
          </div>
        ))}
      </div>

      <div className="login-right" style={{
        width: '60%',
        background: 'var(--bg-card)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 72px'
      }}>
        <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
          <div
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '13px',
              cursor: 'pointer',
              marginBottom: '32px',
              width: 'fit-content'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <ArrowLeft size={15} />
            Back to Home
          </div>

          <h2 style={{
            color: 'var(--text-primary)',
            fontSize: '28px',
            fontWeight: '700',
            margin: '0 0 6px'
          }}>Welcome back</h2>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            margin: '0 0 28px'
          }}>Sign in to your account to continue</p>

          {error && (
            <div style={{ padding: '12px', backgroundColor: 'var(--invalid-badge-bg)', color: 'var(--danger)', borderRadius: '6px', fontSize: '14px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--label-text)', fontWeight: '500' }}>Email / Username</label>
              <input
                type="text"
                className="form-input"
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--input-text)'
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ color: 'var(--label-text)', fontWeight: '500' }}>Password</label>
              <input
                type="password"
                className="form-input"
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--input-text)'
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
            University not registered?{' '}
            <Link to="/register" style={{ color: 'var(--link-text)', fontWeight: 'bold', textDecoration: 'none' }}>
              Request Registration
            </Link>
          </div>
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 100
          }}>
            <ThemeToggle variant="default" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
