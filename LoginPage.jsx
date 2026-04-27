import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft } from 'lucide-react';
import logo from '../assets/logo.png';
import ThemeToggle from '../components/shared/ThemeToggle';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const data = await login(email, password);
      if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/university/dashboard');
      }
    } catch (err) {
      const message = err?.message?.toLowerCase() || '';
      if (err?.status === 403 && message.includes('pending')) {
        setError('Your account is pending approval.');
      } else if (err?.status === 403 && message.includes('suspended')) {
        setError('Your account is suspended.');
      } else if (err?.status === 401) {
        setError('Invalid email or password.');
      } else {
        setError(err?.message || 'Unable to login. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-split" style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: isDark ? '#0A1628' : '#EEF2FF'
    }}>
      <div className="login-left" style={{
        width: '40%',
        background: '#0D1B3E',
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
              width: '600px',
              height: '600px',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto',
              position: 'relative',
              zIndex: 1
            }}
          />
          <h3 style={{
            color: '#FFFFFF',
            fontSize: '22px',
            fontWeight: '700',
            textAlign: 'center',
            margin: '-220px 0 0',
            position: 'relative',
            zIndex: 2
          }}>TrustChain</h3>
          <div style={{
            width: '36px',
            height: '2.5px',
            background: '#C9973A',
            borderRadius: '2px',
            marginTop: '8px'
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
              background: '#C9973A',
              flexShrink: 0
            }} />
            <span style={{ color: '#A8B8D8', fontSize: '13px' }}>{text}</span>
          </div>
        ))}
      </div>

      <div className="login-right" style={{
        width: '60%',
        background: isDark ? '#0F2044' : '#FFFFFF',
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
              color: isDark ? '#8899CC' : '#7A8BBF',
              fontSize: '13px',
              cursor: 'pointer',
              marginBottom: '32px',
              width: 'fit-content'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = isDark ? '#FFFFFF' : '#0D1B3E'}
            onMouseLeave={(e) => e.currentTarget.style.color = isDark ? '#8899CC' : '#7A8BBF'}
          >
            <ArrowLeft size={15} />
            Back to Home
          </div>

          <h2 style={{
            color: isDark ? '#FFFFFF' : '#0D1B3E',
            fontSize: '28px',
            fontWeight: '700',
            margin: '0 0 6px'
          }}>Welcome back</h2>

          <p style={{
            color: isDark ? '#8899CC' : '#7A8BBF',
            fontSize: '14px',
            margin: '0 0 28px'
          }}>Sign in to your account to continue</p>

          {error && (
            <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '6px', fontSize: '14px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" style={{ color: isDark ? '#A8B8D8' : '#0D1B3E', fontWeight: '500' }}>Email / Username</label>
              <input
                type="text"
                className="form-input"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.08)' : '#F8FAFF',
                  border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #C8D0E8',
                  color: isDark ? '#FFFFFF' : '#0D1B3E'
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ color: isDark ? '#A8B8D8' : '#0D1B3E', fontWeight: '500' }}>Password</label>
              <input
                type="password"
                className="form-input"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.08)' : '#F8FAFF',
                  border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #C8D0E8',
                  color: isDark ? '#FFFFFF' : '#0D1B3E'
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" style={{ background: '#1B3A6B', color: '#FFFFFF' }} disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: isDark ? '#8899CC' : '#7A8BBF' }}>
            University not registered?{' '}
            <Link to="/register" style={{ color: isDark ? '#C9973A' : '#2A52A0', fontWeight: 'bold', textDecoration: 'none' }}>
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
