import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import IssuedCertificates from "./IssuedCertificates";

const mockedList = vi.fn();
const mockedRevoke = vi.fn();
const mockedConfirmRevoke = vi.fn();

vi.mock("../../context/WalletContext", () => ({
  useWallet: () => ({ wallet: null }),
}));

vi.mock("../../services/api", () => ({
  listCertificatesAPI: (...args) => mockedList(...args),
  revokeCertificateAPI: (...args) => mockedRevoke(...args),
  confirmRevocationAPI: (...args) => mockedConfirmRevoke(...args),
}));

describe("IssuedCertificates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders certificates from API list", async () => {
    mockedList.mockResolvedValueOnce([
      {
        _id: "c1",
        student_name: "John Doe",
        hashed_certificate: "CERT123456",
        issue_date: "2024-05-13T00:00:00.000Z",
        status: "Issued",
        major: "CompSci",
        graduation_date: "2024-05-15",
      },
    ]);

    render(<IssuedCertificates />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("CERT123456")).toBeInTheDocument();
    });
  });
});
