import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import RegisterPage from "./RegisterPage";

const mockedNavigate = vi.fn();
const mockedRegister = vi.fn();

vi.mock("../services/api", () => ({
  registerUniversityAPI: (...args) => mockedRegister(...args),
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

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>,
    );

  it("renders university registration form", () => {
    renderPage();
    expect(screen.getByText("University Registration")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit registration request/i }),
    ).toBeInTheDocument();
  });

  it("submits registration request to backend API", async () => {
    mockedRegister.mockResolvedValueOnce({ message: "ok" });
    renderPage();

    fireEvent.change(document.querySelector('input[name="university_name"]'), {
      target: { value: "Uni A" },
    });
    fireEvent.change(document.querySelector('input[name="country"]'), {
      target: { value: "Egypt" },
    });
    fireEvent.change(document.querySelector('input[name="email"]'), {
      target: { value: "admin@unia.edu" },
    });
    fireEvent.change(document.querySelector('input[name="password"]'), {
      target: { value: "pass1234" },
    });
    fireEvent.change(document.querySelector('input[name="confirmPassword"]'), {
      target: { value: "pass1234" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /submit registration request/i }),
    );

    await waitFor(() => {
      expect(mockedRegister).toHaveBeenCalledTimes(1);
    });
  });
});
