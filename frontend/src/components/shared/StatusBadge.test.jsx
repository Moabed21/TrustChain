import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge Component', () => {
  it('applies status-valid class for valid status', () => {
    render(<StatusBadge status="valid" />);
    const badge = screen.getByText('valid');
    
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('status-valid');
  });

  it('applies status-revoked class for revoked status', () => {
    render(<StatusBadge status="revoked" />);
    const badge = screen.getByText('revoked');
    
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('status-revoked');
  });

  it('falls back to status-invalid for unknown statuses', () => {
    // "pending" is not in the StatusBadge mapping
    // Falls back to "invalid"
    render(<StatusBadge status="pending" />);
    const badge = screen.getByText('pending');
    
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('status-invalid');
  });
});
