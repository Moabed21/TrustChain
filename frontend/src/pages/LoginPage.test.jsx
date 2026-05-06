import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import LoginPage from "./LoginPage";

const mockedNavigate = vi.fn();
const mockedLogin = vi.fn();
const mockedLoadWallet = vi.fn();

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ login: mockedLogin }),
}));

vi.mock("../context/WalletContext", () => ({
  useWallet: () => ({ loadWallet: mockedLoadWallet }),
}));

vi.mock("../context/ThemeContext", () => ({
  useTheme: () => ({ isDark: false, toggleTheme: vi.fn() }),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    );

  it("renders login form", () => {
    renderPage();
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("logs in and navigates to university dashboard", async () => {
    mockedLogin.mockResolvedValueOnce("university");
    mockedLoadWallet.mockResolvedValueOnce();

    renderPage();

    fireEvent.change(document.querySelector('input[type="text"]'), {
      target: { value: "uni@test.edu" },
    });
    fireEvent.change(document.querySelector('input[type="password"]'), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith("uni@test.edu", "secret123");
      expect(mockedLoadWallet).toHaveBeenCalledWith("secret123");
      expect(mockedNavigate).toHaveBeenCalledWith("/university/dashboard");
    });
  });
});
