import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import logo from '../assets/logo.png';
import ThemeToggle from '../components/shared/ThemeToggle';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    }, 1000);
  };

  const inputStyle = {
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    color: 'var(--input-text)'
  };

  const labelStyle = {
    color: 'var(--label-text)',
    fontWeight: '500'
  };

  return (
    <div className="login-split" style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--bg-app)'
    }}>
      <div className="login-left" style={{
        width: '65%',
        background: 'var(--bg-card)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 72px',
        overflowY: 'auto'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          <h2 style={{
            color: 'var(--text-primary)',
            fontSize: '28px',
            fontWeight: '700',
            margin: '0 0 6px'
          }}>University Registration</h2>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            margin: '0 0 24px'
          }}>Submit your registration request for admin approval</p>

          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ color: 'var(--success)', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Request Submitted!</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>You will be redirected shortly...</p>
            </div>
          ) : (
            <>
              <div style={{
                display: 'flex',
                gap: '12px',
                padding: '12px',
                backgroundColor: 'var(--primary-light)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                marginBottom: '24px'
              }}>
                <Info color="var(--text-secondary)" size={20} style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Registration requires admin approval. You'll be notified via email once your application is reviewed.
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" style={labelStyle}>University Name</label>
                  <input type="text" className="form-input" style={inputStyle} name="name" value={formData.name} onChange={handleChange} required />
                </div>
                
                <div className="form-group">
                  <label className="form-label" style={labelStyle}>Country</label>
                  <input type="text" className="form-input" style={inputStyle} name="country" value={formData.country} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label className="form-label" style={labelStyle}>Official Email</label>
                  <input type="email" className="form-input" style={inputStyle} name="email" value={formData.email} onChange={handleChange} placeholder="admin@university.edu" required />
                </div>

                <div className="form-group">
                  <label className="form-label" style={labelStyle}>Password</label>
                  <input type="password" className="form-input" style={inputStyle} name="password" value={formData.password} onChange={handleChange} required />
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label" style={labelStyle}>Confirm Password</label>
                  <input type="password" className="form-input" style={inputStyle} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                </div>

                <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Registration Request'}
                </button>
              </form>

              <div style={{
                marginTop: '16px',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <ThemeToggle variant="default" />
              </div>

              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <Link to="/login" style={{ textDecoration: 'none', color: 'var(--link-text)', fontWeight: '500', fontSize: '14px' }}>
                  ← Back to Login
                </Link>
              </div>
            </>
          )}

        </div>
      </div>

      <div className="login-right" style={{
        width: '35%',
        background: 'var(--hero-card)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px',
        position: 'relative',
        overflow: 'hidden'
      }}>

        <svg style={{
          position: 'absolute', top: '-60px', right: '-60px', opacity: 0.06
        }} width="300" height="300" viewBox="0 0 300 300">
          <circle cx="150" cy="150" r="140" fill="none" stroke="white" strokeWidth="1"/>
          <circle cx="150" cy="150" r="110" fill="none" stroke="white" strokeWidth="1"/>
          <circle cx="150" cy="150" r="80" fill="none" stroke="white" strokeWidth="1"/>
          <circle cx="150" cy="150" r="50" fill="none" stroke="white" strokeWidth="1"/>
        </svg>

        <svg style={{
          position: 'absolute', bottom: '-40px', left: '-40px', opacity: 0.06
        }} width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="white" strokeWidth="1"/>
          <circle cx="100" cy="100" r="65" fill="none" stroke="white" strokeWidth="1"/>
          <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="1"/>
        </svg>

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
          marginTop: '12px',
          marginBottom: '24px'
        }} />

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
    </div>
  );
};

export default RegisterPage;
