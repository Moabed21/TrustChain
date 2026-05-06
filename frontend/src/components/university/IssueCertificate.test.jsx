import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import IssueCertificate from "./IssueCertificate";

vi.mock("../../context/WalletContext", () => ({
  useWallet: () => ({ wallet: null }),
}));

vi.mock("../../services/api", () => ({
  createCertificateAPI: vi.fn(),
  confirmCertificateAPI: vi.fn(),
}));

describe("IssueCertificate", () => {
  it("renders issue form", () => {
    render(<IssueCertificate />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Issue Certificate" }),
    ).toBeInTheDocument();
    expect(document.querySelector('input[name="student_name"]')).toBeInTheDocument();
  });

  it("shows file-required validation", () => {
    render(<IssueCertificate />);
    fireEvent.change(document.querySelector('input[name="student_name"]'), {
      target: { value: "John Doe" },
    });
    fireEvent.change(document.querySelector('input[name="major"]'), {
      target: { value: "CS" },
    });
    fireEvent.change(document.querySelector('input[name="graduation_date"]'), {
      target: { value: "2024-05-20" },
    });
    fireEvent.click(screen.getByRole("button", { name: /issue certificate/i }));
    expect(screen.getByText("Please upload a certificate PDF.")).toBeInTheDocument();
  });
});
