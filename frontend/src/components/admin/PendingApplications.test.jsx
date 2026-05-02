import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import PendingApplications from "./PendingApplications";

const mockedGetPending = vi.fn();
const mockedApprove = vi.fn();
const mockedReject = vi.fn();

vi.mock("../../services/api", () => ({
  getPendingApplicationsAPI: (...args) => mockedGetPending(...args),
  approveApplicationAPI: (...args) => mockedApprove(...args),
  rejectApplicationAPI: (...args) => mockedReject(...args),
}));

describe("PendingApplications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and renders pending applications from API", async () => {
    mockedGetPending.mockResolvedValueOnce([
      {
        _id: "a1",
        university_name: "Harvard University",
        country: "United States",
        email: "admin@harvard.edu",
        register_date: "2024-01-10T00:00:00.000Z",
      },
    ]);

    render(<PendingApplications />);

    await waitFor(() => {
      expect(screen.getByText("Harvard University")).toBeInTheDocument();
      expect(screen.getByText("Pending Applications")).toBeInTheDocument();
    });
  });
});
