import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, QrCode, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { mockCertificates } from '../data/mockData';
import StatusBadge from '../components/shared/StatusBadge';
import logo from '../assets/logo.png';
import heroVideo from '../assets/land.mp4';
import ThemeToggle from '../components/shared/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const PublicPage = () => {
  const navigate = useNavigate();
  const [hashInput, setHashInput] = useState('');
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const { isDark } = useTheme();

  const handleVerify = () => {
    if (!hashInput.trim()) return;
    setHasSearched(true);
    const cert = mockCertificates[hashInput.trim()];
    setResult(cert || null);
  };

  const renderResult = () => {
    if (!hasSearched) return null;

    if (!result) {
      return (
        <div style={{
          background: '#0D1B3E',
          borderRadius: '12px',
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'rgba(220,38,38,0.2)',
              border: '2px solid #DC2626',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <XCircle size={24} color="#FCA5A5" />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF' }}>
                Certificate Not Found
              </div>
              <div style={{ fontSize: '12px', color: '#8899CC', marginTop: '4px' }}>
                This certificate could not be found on the blockchain
              </div>
            </div>
          </div>
          <div style={{
            background: '#DC2626', color: 'white',
            padding: '4px 12px', borderRadius: '999px',
            fontSize: '11px', fontWeight: '600'
          }}>✗ Invalid</div>
        </div>
      );
    }

    if (result.status === 'valid') {
      return (
        <div style={{
          background: '#0D1B3E',
          borderRadius: '12px',
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'rgba(22,163,74,0.2)',
              border: '2px solid #16A34A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <CheckCircle2 size={24} color="#4ADE80" />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF' }}>
                Certificate is Valid
              </div>
              <div style={{ fontSize: '12px', color: '#8899CC', marginTop: '4px' }}>
                {result?.certificateHash} · Verified on the blockchain
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
            <div style={{
              background: '#16A34A', color: 'white',
              padding: '4px 12px', borderRadius: '999px',
              fontSize: '11px', fontWeight: '600'
            }}>✓ Valid</div>
            <button style={{
              background: '#C9973A', color: 'white', border: 'none',
              padding: '8px 16px', borderRadius: '6px',
              fontSize: '13px', fontWeight: '500', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              ⬇ Download Certificate
            </button>
          </div>
        </div>
      );
    }

    if (result.status === 'revoked') {
      return (
        <div style={{
          background: '#0D1B3E',
          borderRadius: '12px',
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'rgba(217,119,6,0.2)',
              border: '2px solid #D97706',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertCircle size={24} color="#FCD34D" />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF' }}>
                Certificate has been Revoked
              </div>
              <div style={{ fontSize: '12px', color: '#8899CC', marginTop: '4px' }}>
                {result?.certificateHash} · Revoked by issuing university
              </div>
            </div>
          </div>
          <div style={{
            background: '#D97706', color: 'white',
            padding: '4px 12px', borderRadius: '999px',
            fontSize: '11px', fontWeight: '600'
          }}>⚠ Revoked</div>
        </div>
      );
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0A1628', marginTop: 0, paddingTop: 0, position: 'relative' }}>
      <header style={{ background: '#0D1B3E', width: '100%', position: 'relative' }}>
      
        {/* New Single Unified Top Bar */}
        <div style={{
          background: 'transparent',
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          zIndex: '10',
          padding: '16px 60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          {/* Left: Logo + Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={logo}
              alt="TrustChain"
              style={{ width: '44px', height: '44px', objectFit: 'contain' }}
            />
            <div>
              <span style={{
                color: '#FFFFFF',
                fontWeight: '700',
                fontSize: '16px',
                display: 'block',
                lineHeight: '1.2'
              }}>TrustChain</span>
              <span style={{
                color: '#8899CC',
                fontSize: '11px'
              }}>Certificate Verification</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ThemeToggle variant="navbar" />

            {/* Right: Login button */}
            <button
              onClick={() => navigate('/login')}
              style={{
                background: '#C9973A',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
              Login →
            </button>
          </div>
        </div>
      
        {/* Hero Content */}
        <div style={{ position: 'relative', width: '100%' }}>
          <video
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '500px',
              objectFit: 'cover',
              display: 'block',
              margin: '0',
              padding: '0'
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '0',
            right: '0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            zIndex: 5
          }}>
            <h1 className="hero-title">TrustChain</h1>
            <div className="hero-divider" />
            <p className="hero-subtitle">
              Instant, tamper-proof, and globally trusted.
            </p>
          </div>
        </div>
      </header>

      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark ? '#0A1628' : '#EEF2FF',
        padding: '48px 20px'
      }}>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        
        <div style={{ width: '100%', maxWidth: '820px' }}>
          <div className="card" style={{ 
            padding: '32px',
            background: isDark ? '#0F2044' : '#FFFFFF',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #C8D0E8',
            borderRadius: '16px',
            boxShadow: isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.07)'
          }}>
            <h2 style={{ marginBottom: '24px', fontSize: '24px', color: isDark ? '#FFFFFF' : '#0D1B3E' }}>Verify Certificate</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '32px' }}>
              
              {/* Left Column - QR */}
              <div className="qr-border-animated">
                <div style={{
                  background: isDark ? '#0D1B3E' : '#FFFFFF',
                  borderRadius: '10px',
                  padding: '28px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}>
                  <QrCode color="#94A3B8" size={52} />
                  <h3 style={{ marginTop: '12px', marginBottom: '8px', fontSize: '16px', color: '#A8B8D8' }}>Scan QR Code</h3>
                  <p style={{ fontSize: '13px', color: '#A8B8D8', marginBottom: '16px' }}>Use your device camera to scan the certificate QR code</p>
                  <button className="btn btn-outline w-full" style={{ marginTop: 'auto' }}>
                    Start QR Scanner
                  </button>
                </div>
              </div>

              {/* Right Column - Manual Input */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '500', color: isDark ? '#A8B8D8' : '#0D1B3E' }}>Certificate Hash / ID</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter certificate hash or ID"
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.08)' : '#F8FAFF',
                      border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #C8D0E8',
                      color: isDark ? '#FFFFFF' : '#0D1B3E',
                      borderRadius: '8px',
                      height: '40px',
                      padding: '0 12px',
                      width: '100%'
                    }}
                  />
                  <div className="text-muted text-xs" style={{ marginTop: '6px', color: isDark ? '#8899CC' : '#7A8BBF' }}>Try: CERT123456 (Valid) or CERT789012 (Revoked)</div>
                </div>
                
                <button className="btn btn-primary w-full" style={{ marginTop: '12px' }} onClick={handleVerify}>
                  Verify Certificate
                </button>
              </div>

            </div>
          </div>

          {/* Result Section */}
          {renderResult()}
        </div>
      </main>

      <footer style={{
        background: '#0A1628',
        padding: '32px 60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTop: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ color: '#8899CC', fontSize: '13px' }}>
          © 2026 TrustChain. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default PublicPage;
