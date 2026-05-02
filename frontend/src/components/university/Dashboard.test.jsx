import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Dashboard from "./Dashboard";

const mockedListCertificates = vi.fn();

vi.mock("../../services/api", () => ({
  listCertificatesAPI: (...args) => mockedListCertificates(...args),
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: { email: "uni@test.edu" } }),
}));

describe("University Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

  it("renders dashboard with fetched certificate stats", async () => {
    mockedListCertificates.mockResolvedValueOnce([
      {
        _id: "1",
        student_name: "John",
        hashed_certificate: "abc",
        issue_date: "2024-01-01T00:00:00.000Z",
        status: "Issued",
      },
      {
        _id: "2",
        student_name: "Jane",
        hashed_certificate: "def",
        issue_date: "2024-02-01T00:00:00.000Z",
        status: "Revoked",
      },
    ]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("John")).toBeInTheDocument();
    });
  });
});
