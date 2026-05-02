import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';

const IssueCertificate = () => {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    student_name: '',
    major: '',
    graduation_date: ''
  });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const validateFile = (selectedFile) => {
    setError(null);
    if (selectedFile.type !== 'application/pdf' || selectedFile.size > 5 * 1024 * 1024) {
      setError("Please upload a valid PDF document under 5MB.");
      setFile(null);
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      if (validateFile(e.target.files[0])) {
        setFile(e.target.files[0]);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload a certificate PDF.");
      return;
    }

    const randomHash = "CERT" + Math.floor(100000 + Math.random() * 900000);
    setSuccess(randomHash);

    // In a real app we'd add to context/backend here
    // Mocking success behavior
    setFormData({ student_name: '', major: '', graduation_date: '' });
    setFile(null);

    setTimeout(() => setSuccess(null), 5000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '640px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Issue Certificate</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Issue a new academic certificate on the blockchain</p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '640px', padding: '32px' }}>

        {success && (
          <div style={{ padding: '16px', backgroundColor: 'var(--valid-badge-bg)', color: 'var(--valid-badge-text)', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', fontWeight: '500' }}>
            Certificate issued successfully! Hash: <span className="mono">{success}</span>
          </div>
        )}

        {error && (
          <div style={{ padding: '16px', backgroundColor: 'var(--invalid-badge-bg)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', fontWeight: '500' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div
            style={{
              border: '2px dashed var(--border)',
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: '24px',
              backgroundColor: file ? 'var(--primary-light)' : 'transparent',
              borderColor: file ? 'var(--primary)' : 'var(--border)'
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('file-upload').click()}
          >
            <input
              id="file-upload"
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <UploadCloud color={file ? 'var(--primary)' : 'var(--text-muted)'} size={40} style={{ margin: '0 auto', marginBottom: '12px' }} />
            {file ? (
              <div style={{ fontWeight: '500', color: 'var(--primary)' }}>{file.name}</div>
            ) : (
              <>
                <div style={{ fontWeight: '500', marginBottom: '4px' }}>Click to upload certificate PDF</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>or drag and drop</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Accepts .pdf only</div>
              </>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Student Name</label>
            <input type="text" className="form-input" name="student_name" value={formData.student_name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Degree Title</label>
            <input type="text" className="form-input" name="major" value={formData.major} onChange={handleChange} placeholder="e.g., Bachelor of Science in Computer Science" required />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Graduation Date</label>
            <input
              type="date"
              name="graduation_date"
              value={formData.graduation_date}
              onChange={handleChange}
              required
              lang="en"
              style={{
                height: '40px',
                padding: '0 12px',
                border: '1.5px solid var(--border)',
                borderRadius: '8px',
                fontSize: '14px',
                color: 'var(--text-primary)',
                background: 'var(--bg-card)',
                outline: 'none',
                width: '100%'
              }}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full">
            Issue Certificate
          </button>
        </form>
      </div>
    </div>
  );
};

export default IssueCertificate;
