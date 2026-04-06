import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import IssuedCertificates from './IssuedCertificates';

// Override global mock data
vi.mock('../../data/mockData', () => ({
  mockIssuedCertificates: [
    { id: 1, studentName: "John Doe", hash: "CERT123456", issueDate: "2024-05-13", status: "valid", degreeTitle: "CompSci", graduationDate: "2024-05-15" },
    { id: 2, studentName: "Jane Smith", hash: "CERT987654", issueDate: "2024-06-20", status: "revoked", degreeTitle: "Engineering", graduationDate: "2023-06-20" },
  ]
}));

describe('IssuedCertificates Component', () => {
  it('renders the table correctly based on the mock array', () => {
    render(<IssuedCertificates />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('CERT123456')).toBeInTheDocument();
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('CERT987654')).toBeInTheDocument();
    
    const rows = screen.getAllByRole('row');
    // Header + 2 data rows = 3 rows
    expect(rows).toHaveLength(3);
  });

  it('opens CertificateDetailsModal when "View Details" action is clicked', () => {
    render(<IssuedCertificates />);
    
    const viewButtons = screen.getAllByRole('button', { name: /view details/i });
    // First button maps to John Doe entry
    fireEvent.click(viewButtons[0]);

    // Validation ensures modal UI elements appear
    expect(screen.getByText('Certificate Details')).toBeInTheDocument();
    expect(screen.getByText('Complete information about this certificate')).toBeInTheDocument();
    
    // Explicit check for John Doe's degree title dynamically loaded into the modal details
    expect(screen.getByText('CompSci')).toBeInTheDocument();
  });

  it('triggers ConfirmModal when "Revoke" button is clicked for a valid certificate', () => {
    render(<IssuedCertificates />);
    
    // Valid certificate will render a Revoke button (there's exactly 1 valid mock here)
    const revokeButton = screen.getByRole('button', { name: /revoke/i });
    fireEvent.click(revokeButton);

    // Validation ensures ConfirmModal triggers with respective dialog
    const modalTitles = screen.getAllByText('Revoke Certificate');
    expect(modalTitles.length).toBeGreaterThanOrEqual(1);
    
    expect(screen.getByText(/Are you sure you want to revoke the certificate for John Doe\?/i)).toBeInTheDocument();
  });
});
