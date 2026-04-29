import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Dashboard from "./Dashboard";

const { mockDataStore } = vi.hoisted(() => ({
  mockDataStore: { current: [] },
}));

vi.mock("../../data/mockData", () => ({
  get mockIssuedCertificates() {
    return mockDataStore.current;
  },
}));

import { AuthProvider } from "../../context/AuthContext";

describe("University Dashboard Component", () => {
  beforeEach(() => {
    // Reset to a standard set of mock data before each test
    mockDataStore.current = [
      {
        id: 1,
        studentName: "Student 1",
        hash: "CERT1",
        issueDate: "2024-01-01",
        status: "valid",
      },
      {
        id: 2,
        studentName: "Student 2",
        hash: "CERT2",
        issueDate: "2024-01-02",
        status: "revoked",
      },
      {
        id: 3,
        studentName: "Student 3",
        hash: "CERT3",
        issueDate: "2024-01-03",
        status: "valid",
      },
      {
        id: 4,
        studentName: "Student 4",
        hash: "CERT4",
        issueDate: "2024-01-04",
        status: "valid",
      },
    ];
  });

  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>,
    );
  };

  it("renders correctly within a BrowserRouter wrapper", () => {
    renderDashboard();
    expect(
      screen.getByRole("heading", { level: 1, name: /dashboard/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Welcome back, University/i)).toBeInTheDocument();
  });

  it("verifies Quick Actions buttons are present in the DOM", () => {
    renderDashboard();
    expect(
      screen.getByRole("button", { name: /issue new certificate/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /view all certificates/i }),
    ).toBeInTheDocument();
  });

  it("calculates and renders stats cards (Total, Valid, Revoked, and This Month) exactly", () => {
    // Calculate current month for "This Month" test
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, "0");

    const todayStr = `${currentYear}-${currentMonth}-15T12:00:00Z`;

    // Add a certificate dated this month
    mockDataStore.current = [
      ...mockDataStore.current,
      {
        id: 5,
        studentName: "Student 5",
        hash: "CERT5",
        issueDate: todayStr,
        status: "valid",
      },
    ];

    renderDashboard();

    // With 5 records: 4 are valid, 1 is revoked.
    // 5 records: 4 valid, 1 revoked
    expect(screen.getByText("80% of total")).toBeInTheDocument();
    expect(screen.getByText("20% of total")).toBeInTheDocument();

    const getStatNumber = (labelText) => {
      const label = screen.getByText(labelText);
      return label.closest(".stat-card").querySelector(".stat-number")
        .textContent;
    };

    expect(getStatNumber("Total Certificates Issued")).toBe("5");
    expect(getStatNumber("Valid Certificates")).toBe("4");
    expect(getStatNumber("Revoked Certificates")).toBe("1");
    expect(getStatNumber("Issued This Month")).toBe("1");
  });

  it("limits the display to the 5 most recent certificates", () => {
    // Add 6 records
    mockDataStore.current = [
      {
        id: 1,
        studentName: "Student 1",
        hash: "CERT1",
        issueDate: "2024-01-01",
        status: "valid",
      },
      {
        id: 2,
        studentName: "Student 2",
        hash: "CERT2",
        issueDate: "2024-01-02",
        status: "valid",
      },
      {
        id: 3,
        studentName: "Student 3",
        hash: "CERT3",
        issueDate: "2024-01-03",
        status: "valid",
      },
      {
        id: 4,
        studentName: "Student 4",
        hash: "CERT4",
        issueDate: "2024-01-04",
        status: "valid",
      },
      {
        id: 5,
        studentName: "Student 5",
        hash: "CERT5",
        issueDate: "2024-01-05",
        status: "valid",
      },
      {
        id: 6,
        studentName: "Student 6",
        hash: "CERT6",
        issueDate: "2024-01-06",
        status: "valid",
      },
    ];

    renderDashboard();

    // The Dashboard component slices the array to the last 5 elements, then reverses it
    // Therefore 'Student 1' should not be present
    expect(screen.queryByText("Student 1")).not.toBeInTheDocument();
    expect(screen.getByText("Student 2")).toBeInTheDocument();
    expect(screen.getByText("Student 6")).toBeInTheDocument();

    // 1 header row + 5 data rows = 6 rows
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(6);
  });

  it("shows an empty state if none exist", () => {
    mockDataStore.current = [];
    renderDashboard();

    expect(screen.getByText("No certificates issued yet")).toBeInTheDocument();
    expect(
      screen.getByText("Issue your first certificate to see it here"),
    ).toBeInTheDocument();

    // Ensure the table of recent certificates is not rendered
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
