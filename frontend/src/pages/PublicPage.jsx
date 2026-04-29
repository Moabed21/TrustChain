import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, CheckCircle2, XCircle, AlertCircle, Camera, Upload, X, ArrowLeft } from 'lucide-react';
import { mockCertificates } from '../data/mockData';
import logo from '../assets/logo.png';
import heroVideo from '../assets/land.mp4';
import ThemeToggle from '../components/shared/ThemeToggle';

const PublicPage = () => {
  const navigate = useNavigate();
  const [hashInput, setHashInput] = useState('');
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [scanMode, setScanMode] = useState(null);
  // null | 'camera' | 'file'
  const [cameraError, setCameraError] = useState('');
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const startCamera = async () => {
    setCameraError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      setScanMode('camera');
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      setCameraError('Camera not available. Please upload a QR code image instead.');
      setScanMode('file');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setScanMode(null);
  };

  const handleQRFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // UI only for now - will connect to QR decode API later
      alert(`PDF selected: ${file.name}\nWill be verified via backend.`);
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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
          background: 'var(--bg-sidebar)',
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
              background: 'rgba(220,38,38,0.1)',
              border: '2px solid var(--danger)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <XCircle size={24} color="var(--danger)" />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--hero-text)' }}>
                Certificate Not Found
              </div>
              <div style={{ fontSize: '12px', color: 'var(--sidebar-text)', marginTop: '4px' }}>
                This certificate could not be found on the blockchain
              </div>
            </div>
          </div>
          <div style={{
            background: 'var(--danger)', color: 'white',
            padding: '4px 12px', borderRadius: '999px',
            fontSize: '11px', fontWeight: '600'
          }}>✗ Invalid</div>
        </div>
      );
    }

    if (result.status === 'valid') {
      return (
        <div style={{
          background: 'var(--bg-sidebar)',
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
              background: 'rgba(22,163,74,0.1)',
              border: '2px solid var(--success)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <CheckCircle2 size={24} color="var(--success)" />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--hero-text)' }}>
                Certificate is Valid
              </div>
              <div style={{ fontSize: '12px', color: 'var(--sidebar-text)', marginTop: '4px' }}>
                {result?.certificateHash} · Verified on the blockchain
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
            <div style={{
              background: 'var(--success)', color: 'white',
              padding: '4px 12px', borderRadius: '999px',
              fontSize: '11px', fontWeight: '600'
            }}>✓ Valid</div>
            <button 
              style={{
                background: 'var(--accent)', color: 'white', border: 'none',
                padding: '8px 16px', borderRadius: '6px',
                fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              ⬇ Download Certificate
            </button>
          </div>
        </div>
      );
    }

    if (result.status === 'revoked') {
      return (
        <div style={{
          background: 'var(--bg-sidebar)',
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
              background: 'rgba(217,119,6,0.1)',
              border: '2px solid var(--warning)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertCircle size={24} color="var(--warning)" />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--hero-text)' }}>
                Certificate has been Revoked
              </div>
              <div style={{ fontSize: '12px', color: 'var(--sidebar-text)', marginTop: '4px' }}>
                {result?.certificateHash} · Revoked by issuing university
              </div>
            </div>
          </div>
          <div style={{
            background: 'var(--warning)', color: 'white',
            padding: '4px 12px', borderRadius: '999px',
            fontSize: '11px', fontWeight: '600'
          }}>⚠ Revoked</div>
        </div>
      );
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--hero-bg)', marginTop: 0, paddingTop: 0, position: 'relative' }}>
      <header style={{ background: 'var(--hero-card)', width: '100%', position: 'relative' }}>

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
                color: 'var(--hero-text)',
                fontWeight: '700',
                fontSize: '16px',
                display: 'block',
                lineHeight: '1.2'
              }}>TrustChain</span>
              <span style={{
                color: 'var(--hero-muted)',
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
                background: 'var(--accent)',
                color: 'var(--hero-text)',
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
        background: 'var(--bg-app)',
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
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow)'
          }}>
            <h2 style={{ marginBottom: '24px', fontSize: '24px', color: 'var(--text-primary)' }}>Verify Certificate</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '32px' }}>

              {/* Left Column - QR */}
              <div className="qr-border-animated">
                <div style={{
                  background: 'var(--bg-card)',
                  borderRadius: '10px',
                  padding: '24px',
                  textAlign: 'center'
                }}>

                  {/* Default state - no scan active */}
                  {scanMode === null && (
                    <>
                      <QrCode size={48} color="var(--hero-icon-muted)" style={{ margin: '0 auto 12px' }} />
                      <h3 style={{
                        fontSize: '15px', fontWeight: '600',
                        color: 'var(--text-primary)', margin: '0 0 8px'
                      }}>
                        Scan QR Code
                      </h3>
                      <p style={{
                        fontSize: '13px', color: 'var(--text-secondary)',
                        margin: '0 0 16px', lineHeight: '1.5'
                      }}>
                        Use your device camera or upload a certificate PDF
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          onClick={startCamera}
                          style={{
                            width: '100%',
                            height: '42px',
                            border: '1.5px solid var(--primary)',
                            borderRadius: '8px',
                            background: 'var(--primary)',
                            color: 'var(--hero-text)',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hero-card-alt)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
                        >
                          <Camera size={16} />
                          Open Camera
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            width: '100%',
                            height: '42px',
                            border: '1.5px solid var(--border)',
                            borderRadius: '8px',
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--primary-light)';
                            e.currentTarget.style.borderColor = 'var(--primary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'var(--border)';
                          }}
                        >
                          <Upload size={16} />
                          Upload Certificate PDF
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="application/pdf"
                          onChange={handleQRFileUpload}
                          style={{ display: 'none' }}
                        />
                      </div>
                    </>
                  )}

                  {/* Camera active state */}
                  {scanMode === 'camera' && (
                    <>
                      <div style={{ position: 'relative', marginBottom: '12px' }}>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            background: '#000'
                          }}
                        />
                        {/* Scan overlay */}
                        <div style={{
                          position: 'absolute',
                          top: '50%', left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '120px', height: '120px',
                          border: '2px solid var(--hero-scan-border)',
                          borderRadius: '8px',
                          boxShadow: '0 0 0 9999px rgba(0,0,0,0.3)'
                        }} />
                      </div>
                      <p style={{
                        fontSize: '12px', color: 'var(--text-secondary)',
                        margin: '0 0 12px'
                      }}>
                        Point camera at QR code
                      </p>
                      <button
                        onClick={stopCamera}
                        style={{
                          width: '100%',
                          height: '38px',
                          border: '1.5px solid var(--invalid-text)',
                          borderRadius: '8px',
                          background: 'transparent',
                          color: 'var(--invalid-text)',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--invalid-bg)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <X size={15} />
                        Stop Camera
                      </button>
                    </>
                  )}

                  {/* File upload state */}
                  {scanMode === 'file' && (
                    <>
                      {cameraError && (
                        <div style={{
                          background: 'var(--invalid-bg)',
                          border: '1px solid var(--invalid-border)',
                          borderRadius: '8px', padding: '10px 12px',
                          marginBottom: '12px', fontSize: '12px',
                          color: 'var(--invalid-text)', textAlign: 'left'
                        }}>
                          ⚠ {cameraError}
                        </div>
                      )}
                      <QrCode size={40} color="var(--hero-icon-muted)" style={{ margin: '0 auto 12px' }} />
                      <p style={{
                        fontSize: '13px', color: 'var(--text-secondary)',
                        margin: '0 0 12px'
                      }}>
                        Upload a QR code image to verify
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          width: '100%',
                          height: '42px',
                          border: '1.5px solid var(--primary)',
                          borderRadius: '8px',
                          background: 'var(--primary)',
                          color: 'var(--hero-text)',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hero-card-alt)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
                      >
                        <Upload size={16} />
                        Choose Certificate PDF
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={handleQRFileUpload}
                        style={{ display: 'none' }}
                      />
                      <button
                        onClick={() => { setScanMode(null); setCameraError(''); }}
                        style={{
                          width: '100%',
                          height: '36px',
                          marginTop: '8px',
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--text-muted)',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        <ArrowLeft size={14} />
                        Back
                      </button>
                    </>
                  )}

                </div>
              </div>

              {/* Right Column - Manual Input */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '500', color: 'var(--label-text)' }}>Certificate Hash / ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter certificate hash or ID"
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    style={{
                      background: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      color: 'var(--input-text)',
                      borderRadius: '8px',
                      height: '40px',
                      padding: '0 12px',
                      width: '100%'
                    }}
                  />
                  <div className="text-muted text-xs" style={{ marginTop: '6px', color: 'var(--text-muted)' }}>Try: CERT123456 (Valid) or CERT789012 (Revoked)</div>
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
        background: 'var(--hero-bg)',
        padding: '32px 60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTop: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ color: 'var(--hero-muted)', fontSize: '13px' }}>
          © 2026 TrustChain. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default PublicPage;