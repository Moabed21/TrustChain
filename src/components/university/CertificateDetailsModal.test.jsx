import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CertificateDetailsModal from './CertificateDetailsModal';

const sampleMockCert = { 
  id: 1, 
  studentName: "John Doe", 
  hash: "CERT123456", 
  issueDate: "2024-05-13", 
  status: "valid", 
  degreeTitle: "Bachelor of Science in Computer Science", 
  graduationDate: "2024-05-15" 
};

describe('CertificateDetailsModal Component', () => {
  it('does not render any content if isOpen is logically false', () => {
    const { container } = render(
      <CertificateDetailsModal 
        isOpen={false} 
        cert={sampleMockCert} 
        onClose={() => {}} 
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('accurately displays fully mapped certificate details when isOpen is true', () => {
    render(
      <CertificateDetailsModal 
        isOpen={true} 
        cert={sampleMockCert} 
        onClose={() => {}} 
      />
    );

    expect(screen.getByText('Certificate Details')).toBeInTheDocument();
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('CERT123456')).toBeInTheDocument();
    
    // Validating elements with specific identifiers / text
    expect(screen.getByText('Bachelor of Science in Computer Science')).toBeInTheDocument();
    expect(screen.getByText('2024-05-15')).toBeInTheDocument();
    expect(screen.getByText('2024-05-13')).toBeInTheDocument();
    
    // Button actions validations
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download certificate/i })).toBeInTheDocument();
  });
});
