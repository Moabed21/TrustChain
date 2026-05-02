import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge from "./StatusBadge";

describe("StatusBadge", () => {
  it("maps Issued to valid style", () => {
    render(<StatusBadge status="Issued" />);
    const badge = screen.getByText("Issued");
    expect(badge).toHaveClass("status-valid");
  });

  it("maps PendingRevocation to suspended style with readable label", () => {
    render(<StatusBadge status="PendingRevocation" />);
    const badge = screen.getByText("Revoking…");
    expect(badge).toHaveClass("status-suspended");
  });
});
