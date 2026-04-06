import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge Abstract Component', () => {
  it('binds native standard class styling for "valid" inputs', () => {
    render(<StatusBadge status="valid" />);
    const badge = screen.getByText('valid');
    
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('status-valid');
  });

  it('binds appropriate warning variants for "revoked" inputs', () => {
    render(<StatusBadge status="revoked" />);
    const badge = screen.getByText('revoked');
    
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('status-revoked');
  });

  it('safely wraps unpredictable values using fallback styling mechanism explicitly', () => {
    // "pending" is not natively listed within StatusStyles inside the component mapping logic
    // Thus it falls to "invalid" gracefully
    render(<StatusBadge status="pending" />);
    const badge = screen.getByText('pending');
    
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('status-invalid');
  });
});
