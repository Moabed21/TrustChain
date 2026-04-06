import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { AuthProvider } from '../context/AuthContext';

// Mock useNavigate from react-router-dom
const mockedNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('renders the email input, password input, and submit button', () => {
    const { container } = renderLogin();
    
    expect(container.querySelector('input[type="text"]')).toBeInTheDocument();
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('shows an error message if invalid credentials are provided', () => {
    const { container } = renderLogin();
    
    // Fill in invalid details
    fireEvent.change(container.querySelector('input[type="text"]'), { target: { value: 'wrong@email.com' } });
    fireEvent.change(container.querySelector('input[type="password"]'), { target: { value: 'wrongpass' } });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByText('Invalid credentials or role. Please try again.')).toBeInTheDocument();
    // Verify navigate was NOT called
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it('navigates to /admin/pending on successful login as an Admin', () => {
    const { container } = renderLogin();

    fireEvent.change(container.querySelector('input[type="text"]'), { target: { value: 'admin@trustchain.com' } });
    fireEvent.change(container.querySelector('input[type="password"]'), { target: { value: 'password' } });
    
    // Select Admin role
    fireEvent.change(container.querySelector('select'), { target: { value: 'admin' } });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.queryByText('Invalid credentials or role. Please try again.')).not.toBeInTheDocument();
    expect(mockedNavigate).toHaveBeenCalledWith('/admin/pending');
  });

  it('navigates to /university/dashboard on successful login as a University', () => {
    const { container } = renderLogin();

    fireEvent.change(container.querySelector('input[type="text"]'), { target: { value: 'admin@stanford.edu' } });
    fireEvent.change(container.querySelector('input[type="password"]'), { target: { value: 'password' } });
    
    // Select University role
    fireEvent.change(container.querySelector('select'), { target: { value: 'university' } });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.queryByText('Invalid credentials or role. Please try again.')).not.toBeInTheDocument();
    expect(mockedNavigate).toHaveBeenCalledWith('/university/dashboard');
  });
});
