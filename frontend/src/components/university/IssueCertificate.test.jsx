import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import IssueCertificate from './IssueCertificate';

describe('IssueCertificate Component', () => {
  it('renders all form elements accurately', () => {
    const { container } = render(<IssueCertificate />);
    
    // Check all form inputs are rendered
    expect(container.querySelector('input[name="studentName"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="degreeTitle"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="graduationDate"]')).toBeInTheDocument();
    
    expect(screen.getByText('Student Name')).toBeInTheDocument();
    expect(screen.getByText('Degree Title')).toBeInTheDocument();
    expect(screen.getByText('Graduation Date')).toBeInTheDocument();
    

    expect(container.querySelector('input[type="file"]')).toBeInTheDocument();
    
    // Submit button
    expect(screen.getByRole('button', { name: /issue certificate/i })).toBeInTheDocument();
  });

  it('requires file upload and shows success hash on valid submission', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    const { container } = render(<IssueCertificate />);
    const submitBtn = screen.getByRole('button', { name: /issue certificate/i });

    // Fill required fields
    fireEvent.change(container.querySelector('input[name="studentName"]'), { target: { value: 'John Doe' } });
    fireEvent.change(container.querySelector('input[name="degreeTitle"]'), { target: { value: 'BSc Computer Science' } });
    fireEvent.change(container.querySelector('input[name="graduationDate"]'), { target: { value: '2024-05-15' } });
    
    // Try submitting without file
    fireEvent.click(submitBtn);
    expect(alertSpy).toHaveBeenCalledWith("Please upload a certificate PDF.");
    
    // Attach a valid PDF file
    const file = new File(['dummy'], 'test-cert.pdf', { type: 'application/pdf' });
    const fileInput = container.querySelector('input[type="file"]');
    

    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Submit with file attached
    fireEvent.click(submitBtn);

    // Success message with hash should appear
    expect(screen.getByText(/Certificate issued successfully! Hash:/i)).toBeInTheDocument();
    
    alertSpy.mockRestore();
  });

  it('rejects non-PDF files and files over 5MB', () => {
    const { container } = render(<IssueCertificate />);
    const fileInput = container.querySelector('input[type="file"]');

    // 1. Invalid file type
    const invalidFile = new File(['png data'], 'diagram.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });
    
    expect(screen.getByText('Please upload a valid PDF document under 5MB.')).toBeInTheDocument();

    // 2. Oversized PDF
    const oversizeFile = new File(['data'], 'thesis.pdf', { type: 'application/pdf' });
    Object.defineProperty(oversizeFile, 'size', { value: 6 * 1024 * 1024 });

    fireEvent.change(fileInput, { target: { files: [oversizeFile] } });
    

    expect(screen.getByText('Please upload a valid PDF document under 5MB.')).toBeInTheDocument();
  });
});
