import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';


const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('RegisterPage Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderRegister = () => render(
    <BrowserRouter>
      <RegisterPage />
    </BrowserRouter>
  );

  it('renders the university registration form core requirements', () => {
    const { container } = renderRegister();
    
    expect(container.querySelector('input[name="name"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="country"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="email"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="password"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="confirmPassword"]')).toBeInTheDocument();
    
    expect(screen.getByRole('button', { name: /submit registration request/i })).toBeInTheDocument();
  });

  it('triggers a browser mismatch alert preventing submission', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { container } = renderRegister();
    
    fireEvent.change(container.querySelector('input[name="password"]'), { target: { value: 'pass123' } });
    fireEvent.change(container.querySelector('input[name="confirmPassword"]'), { target: { value: 'passXYZ' } });
    
    // Submit the form directly to bypass HTML validation
    fireEvent.submit(container.querySelector('form'));
    
    expect(alertSpy).toHaveBeenCalledWith("Passwords don't match");
    alertSpy.mockRestore();
  });

  it('successfully executes registration and follows mocked timer sequencing to redirect', () => {
    const { container } = renderRegister();
    
    // Fill in form fields
    fireEvent.change(container.querySelector('input[name="password"]'), { target: { value: 'pass123' } });
    fireEvent.change(container.querySelector('input[name="confirmPassword"]'), { target: { value: 'pass123' } });
    fireEvent.change(container.querySelector('input[name="name"]'), { target: { value: 'University Tech' } });
    fireEvent.change(container.querySelector('input[name="country"]'), { target: { value: 'Brazil' } });
    fireEvent.change(container.querySelector('input[name="email"]'), { target: { value: 'admin@uni.br' } });
    
    fireEvent.submit(container.querySelector('form'));
    
    // Button shows loading state
    expect(screen.getByRole('button')).toHaveTextContent(/submitting/i);
    
    // Advance timers past the 1-second processing delay
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    
    // Success message appears
    expect(screen.getByText('Request Submitted!')).toBeInTheDocument();
    
    // Advance past redirect delay
    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(mockedNavigate).toHaveBeenCalledWith('/login');
  });
});
