import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PendingApplications from './PendingApplications';

// Mock the mockData to isolate testing state
vi.mock('../../data/mockData', () => ({
  mockPendingApplications: [
    { id: 1, name: "Harvard University", country: "United States", email: "admin@harvard.edu", wallet: "0x123", requestDate: "2024-01-10" },
    { id: 2, name: "Oxford University", country: "United Kingdom", email: "admin@ox.ac.uk", wallet: "0x456", requestDate: "2024-01-12" },
  ]
}));

describe('PendingApplications Component', () => {
  const renderComponent = () => render(<PendingApplications />);

  it('renders the component and populates the table correctly', () => {
    renderComponent();
    
    expect(screen.getByText('Pending Applications')).toBeInTheDocument();
    expect(screen.getByText('Harvard University')).toBeInTheDocument();
    expect(screen.getByText('Oxford University')).toBeInTheDocument();
    
    const rows = screen.getAllByRole('row');
    // 1 header row + 2 data rows = 3 rows
    expect(rows).toHaveLength(3);
  });

  it('opens ConfirmModal with correct details when Approve button is clicked', () => {
    renderComponent();

    // The first Approve button corresponds to Harvard University
    const approveButtons = screen.getAllByRole('button', { name: /approve/i });
    fireEvent.click(approveButtons[0]);

    // Modal should be open with correct title
    expect(screen.getByText('Approve Application')).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to approve the registration for Harvard University\?/i)
    ).toBeInTheDocument();
  });

  it('opens ConfirmModal with correct details when Reject button is clicked', () => {
    renderComponent();

    // The first Reject button corresponds to Harvard University
    const rejectButtons = screen.getAllByRole('button', { name: /reject/i });
    fireEvent.click(rejectButtons[0]);

    // Modal should be open with correct title
    expect(screen.getByText('Reject Application')).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to reject the registration for Harvard University\?/i)
    ).toBeInTheDocument();
  });
});
