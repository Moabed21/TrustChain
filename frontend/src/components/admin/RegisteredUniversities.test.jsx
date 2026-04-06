import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RegisteredUniversities from './RegisteredUniversities';

// Mock the mockData to isolate testing state and status varieties
vi.mock('../../data/mockData', () => ({
  mockRegisteredUniversities: [
    { id: 1, name: "Stanford University", country: "United States", status: "active", registeredDate: "2023-06-15", certificatesIssued: 1247, wallet: "0x123" },
    { id: 2, name: "Cambridge University", country: "United Kingdom", status: "suspended", registeredDate: "2023-09-10", certificatesIssued: 543, wallet: "0x456" },
  ]
}));

describe('RegisteredUniversities Component', () => {
  const renderComponent = () => render(<RegisteredUniversities />);

  it('renders the table with correct mock data', () => {
    renderComponent();
    
    expect(screen.getByText('Registered Universities')).toBeInTheDocument();
    expect(screen.getByText('Stanford University')).toBeInTheDocument();
    expect(screen.getByText('Cambridge University')).toBeInTheDocument();

    const rows = screen.getAllByRole('row');
    // 1 header row + 2 data rows = 3 rows
    expect(rows).toHaveLength(3);
  });

  it('opens ConfirmModal with correct details when Suspend button is clicked for active universities', () => {
    renderComponent();

    const suspendButton = screen.getByRole('button', { name: /suspend/i });
    fireEvent.click(suspendButton);

    expect(screen.getByText('Suspend University')).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to suspend Stanford University\?/i)
    ).toBeInTheDocument();
  });

  it('opens ConfirmModal with correct details when Reactivate button is clicked for suspended universities', () => {
    renderComponent();

    const reactivateButton = screen.getByRole('button', { name: /reactivate/i });
    fireEvent.click(reactivateButton);

    expect(screen.getByText('Reactivate University')).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to reactivate Cambridge University\?/i)
    ).toBeInTheDocument();
  });
});
