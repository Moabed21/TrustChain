import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";

const mockedLoginAPI = vi.fn();
const mockedGetMeAPI = vi.fn();
const mockedLogoutAPI = vi.fn();
const mockedStoreAuthToken = vi.fn();
const mockedClearAuthData = vi.fn();

vi.mock("../services/api", () => ({
  loginAPI: (...args) => mockedLoginAPI(...args),
  getMeAPI: (...args) => mockedGetMeAPI(...args),
  logoutAPI: (...args) => mockedLogoutAPI(...args),
  storeAuthToken: (...args) => mockedStoreAuthToken(...args),
  clearAuthData: (...args) => mockedClearAuthData(...args),
}));

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  it("starts logged out", () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("logs in using backend APIs and sets role", async () => {
    mockedLoginAPI.mockResolvedValueOnce({ access_token: "token123" });
    mockedGetMeAPI.mockResolvedValueOnce({
      id: "u1",
      email: "admin@test.com",
      role: "admin",
      status: "Active",
      wallet_address: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.login("admin@test.com", "secret");
    });

    await waitFor(() => {
      expect(result.current.isLoggedIn).toBe(true);
      expect(result.current.role).toBe("admin");
      expect(mockedStoreAuthToken).toHaveBeenCalledWith("token123");
    });
  });
});
