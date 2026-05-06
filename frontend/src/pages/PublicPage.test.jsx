import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import PublicPage from "./PublicPage";

const mockedVerifyByFile = vi.fn();
const mockedVerifyByQr = vi.fn();

vi.mock("../services/api", () => ({
  verifyByFileAPI: (...args) => mockedVerifyByFile(...args),
  verifyByQrAPI: (...args) => mockedVerifyByQr(...args),
}));

vi.mock("../context/ThemeContext", () => ({
  useTheme: () => ({ isDark: false, toggleTheme: vi.fn() }),
}));

describe("PublicPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <PublicPage />
      </BrowserRouter>,
    );

  it("renders verification section", () => {
    renderPage();
    expect(screen.getByText("Verify Certificate")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open camera/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /upload certificate pdf/i }),
    ).toBeInTheDocument();
  });

  it("verifies uploaded PDF with backend API", async () => {
    mockedVerifyByFile.mockResolvedValueOnce({
      certificate_hash: "abc123",
      status: "VALID",
      issuer: "0x1",
      timestamp: 1,
    });
    renderPage();

    const fileInput = document.querySelector('input[type="file"][accept="application/pdf"]');
    const pdfFile = new File(["dummy"], "cert.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, { target: { files: [pdfFile] } });

    await waitFor(() => {
      expect(mockedVerifyByFile).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Certificate is Valid")).toBeInTheDocument();
    });
  });
});
