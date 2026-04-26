import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PublicPage from './PublicPage';

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ isDark: false, toggleTheme: vi.fn() })
}));

// Mock specific hashes to guarantee static integration matches
vi.mock('../services/certificateService', () => ({
  getCertificateByHash: vi.fn((hash) => {
    const data = {
      CERT123456: {
        status: 'valid',
        studentName: 'John Doe',
        issuingUniversity: 'Stanford University',
        certificateHash: 'CERT123456'
      },
      CERT789012: {
        status: 'revoked',
        studentName: 'Jane Smith',
        issuingUniversity: 'MIT',
        certificateHash: 'CERT789012'
      }
    };

    return data[hash] || null;
  })
}));

describe('PublicPage Component', () => {
  const renderPublicPage = () => render(
    <BrowserRouter>
      <PublicPage />
    </BrowserRouter>
  );

  it('renders the QR scanner UI placeholder and manual hash input completely', () => {
    renderPublicPage();

    expect(screen.getByText('Scan QR Code')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open camera/i })).toBeInTheDocument();

    expect(screen.getByPlaceholderText('Enter certificate hash or ID')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /verify certificate/i })).toBeInTheDocument();
  });

  it('verifies a valid mock hash correctly and displays the native validation card', () => {
    renderPublicPage();

    const input = screen.getByPlaceholderText('Enter certificate hash or ID');
    fireEvent.change(input, { target: { value: 'CERT123456' } });

    const verifyBtn = screen.getByRole('button', { name: /verify certificate/i });
    fireEvent.click(verifyBtn);

    // The specific UI success check string
    expect(screen.getByText('Certificate is Valid')).toBeInTheDocument();
  });

  it('verifies a revoked hash and securely flags it identically to system requirements', () => {
    renderPublicPage();

    const input = screen.getByPlaceholderText('Enter certificate hash or ID');
    fireEvent.change(input, { target: { value: 'CERT789012' } });

    const verifyBtn = screen.getByRole('button', { name: /verify certificate/i });
    fireEvent.click(verifyBtn);

    // Warning UI string
    expect(screen.getByText('Certificate has been Revoked')).toBeInTheDocument();
  });

  it('evaluates completely unlisted/invalid hashes as safely disconnected from any records', () => {
    renderPublicPage();

    const input = screen.getByPlaceholderText('Enter certificate hash or ID');
    fireEvent.change(input, { target: { value: 'UNKNOWN_HASH_123' } });

    const verifyBtn = screen.getByRole('button', { name: /verify certificate/i });
    fireEvent.click(verifyBtn);

    expect(screen.getByText('Certificate Not Found')).toBeInTheDocument();
  });
});
