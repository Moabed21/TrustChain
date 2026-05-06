import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CertificateDetailsModal from "./CertificateDetailsModal";

const sampleCert = {
  _id: "c1",
  student_name: "John Doe",
  hashed_certificate: "CERT123456",
  issue_date: "2024-05-13T00:00:00.000Z",
  status: "Issued",
  major: "Bachelor of Science in Computer Science",
  graduation_date: "2024-05-15",
};

describe("CertificateDetailsModal", () => {
  it("does not render when closed", () => {
    const { container } = render(
      <CertificateDetailsModal isOpen={false} cert={sampleCert} onClose={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders certificate details when open", () => {
    render(<CertificateDetailsModal isOpen cert={sampleCert} onClose={() => {}} />);
    expect(screen.getByText("Certificate Details")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("CERT123456")).toBeInTheDocument();
  });
});
