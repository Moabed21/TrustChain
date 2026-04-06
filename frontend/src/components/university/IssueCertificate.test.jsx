import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import IssueCertificate from './IssueCertificate';

describe('IssueCertificate Component', () => {
  it('renders all form elements accurately', () => {
    const { container } = render(<IssueCertificate />);
    
    // Using standard accessibility logic when labels relate to form elements natively
    // We expect basic inputs to be in document.
    // If not naturally associated with 'htmlFor', we can also assert by placeholder or role
    expect(container.querySelector('input[name="studentName"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="degreeTitle"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="graduationDate"]')).toBeInTheDocument();
    
    expect(screen.getByText('Student Name')).toBeInTheDocument();
    expect(screen.getByText('Degree Title')).toBeInTheDocument();
    expect(screen.getByText('Graduation Date')).toBeInTheDocument();
    
    // File input mapping
    expect(container.querySelector('input[type="file"]')).toBeInTheDocument();
    
    // Submit button
    expect(screen.getByRole('button', { name: /issue certificate/i })).toBeInTheDocument();
  });

  it('validates file upload constraint and generates a success hash string upon submission', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    const { container } = render(<IssueCertificate />);
    const submitBtn = screen.getByRole('button', { name: /issue certificate/i });

    // Fill required simple fields BEFORE anything so HTML5 validation doesn't block submit
    fireEvent.change(container.querySelector('input[name="studentName"]'), { target: { value: 'John Doe' } });
    fireEvent.change(container.querySelector('input[name="degreeTitle"]'), { target: { value: 'BSc Computer Science' } });
    fireEvent.change(container.querySelector('input[name="graduationDate"]'), { target: { value: '2024-05-15' } });
    
    // Try submitting without file
    fireEvent.click(submitBtn);
    expect(alertSpy).toHaveBeenCalledWith("Please upload a certificate PDF.");
    
    // Attach valid file dummy payload
    const file = new File(['dummy byte seq'], 'test-cert.pdf', { type: 'application/pdf' });
    const fileInput = container.querySelector('input[type="file"]');
    
    // Simulate file upload using fireEvent.change
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Submit correctly configured form
    fireEvent.click(submitBtn);

    // Success response should appear showing dynamically generated string
    expect(screen.getByText(/Certificate issued successfully! Hash:/i)).toBeInTheDocument();
    
    alertSpy.mockRestore();
  });

  it('displays an error if the uploaded file is not a strict PDF or exceeds 5MB size limit', () => {
    const { container } = render(<IssueCertificate />);
    const fileInput = container.querySelector('input[type="file"]');

    // 1. Invalid file type payload interception
    const invalidFile = new File(['png dummy data chunk'], 'diagram.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });
    
    expect(screen.getByText('Please upload a valid PDF document under 5MB.')).toBeInTheDocument();

    // 2. Oversized payload interception
    const oversizeFile = new File(['dummy abstract content parameter block'], 'thesis.pdf', { type: 'application/pdf' });
    // Dynamically override size prototype for evaluating payload sizing limit bypass evaluation optimally
    Object.defineProperty(oversizeFile, 'size', { value: 6 * 1024 * 1024 });

    fireEvent.change(fileInput, { target: { files: [oversizeFile] } });
    
    // UI error should reliably persist
    expect(screen.getByText('Please upload a valid PDF document under 5MB.')).toBeInTheDocument();
  });
});
