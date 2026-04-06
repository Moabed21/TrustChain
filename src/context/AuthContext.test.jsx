import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

describe('AuthContext', () => {
  it('Initial state should have isLoggedIn: false and user: null', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.role).toBeNull();
  });

  it('Calling login with admin credentials should set isLoggedIn: true and role: admin', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    
    act(() => {
      const success = result.current.login('admin@trustchain.com', 'password', 'admin');
      expect(success).toBe(true);
    });

    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.role).toBe('admin');
    expect(result.current.user).toEqual({ password: 'password', role: 'admin', name: 'System Admin' });
  });

  it('Calling login with university credentials should set isLoggedIn: true and role: university', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    
    act(() => {
      const success = result.current.login('admin@stanford.edu', 'password', 'university');
      expect(success).toBe(true);
    });

    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.role).toBe('university');
  });

  it('Calling logout should successfully clear the user state and set isLoggedIn: false', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    
    act(() => {
      // First login
      result.current.login('admin@trustchain.com', 'password', 'admin');
    });

    expect(result.current.isLoggedIn).toBe(true);

    act(() => {
      // Then logout
      result.current.logout();
    });

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.role).toBeNull();
  });
});
