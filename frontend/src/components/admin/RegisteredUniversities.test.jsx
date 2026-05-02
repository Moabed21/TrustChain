import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import RegisteredUniversities from "./RegisteredUniversities";

const mockedGetAll = vi.fn();
const mockedSuspend = vi.fn();
const mockedReactivate = vi.fn();

vi.mock("../../services/api", () => ({
  getAllUniversitiesAPI: (...args) => mockedGetAll(...args),
  suspendUniversityAPI: (...args) => mockedSuspend(...args),
  reactivateUniversityAPI: (...args) => mockedReactivate(...args),
}));

describe("RegisteredUniversities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders universities returned by API", async () => {
    mockedGetAll.mockResolvedValueOnce([
      {
        _id: "u1",
        university_name: "Stanford University",
        country: "United States",
        status: "Active",
        register_date: "2023-06-15T00:00:00.000Z",
        total_certificates: 10,
        wallet_address: "0x123",
      },
    ]);

    render(<RegisteredUniversities />);

    await waitFor(() => {
      expect(screen.getByText("Registered Universities")).toBeInTheDocument();
      expect(screen.getByText("Stanford University")).toBeInTheDocument();
    });
  });
});
