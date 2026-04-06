export const mockCertificates = {
  CERT123456: {
    status: "valid",
    studentName: "John Doe",
    issuingUniversity: "Stanford University",
    degreeTitle: "Bachelor of Science in Computer Science",
    issueDate: "2024-05-15",
    certificateHash: "CERT123456",
  },
  CERT789012: {
    status: "revoked",
    studentName: "Jane Smith",
    issuingUniversity: "MIT",
    degreeTitle: "Master of Engineering",
    issueDate: "2023-06-20",
    certificateHash: "CERT789012",
  },
};

export const mockPendingApplications = [
  { id: 1, name: "Harvard University", country: "United States", email: "admin@harvard.edu", wallet: "0x742d35Cc...595f0bEb", requestDate: "2024-01-10" },
  { id: 2, name: "University of Oxford", country: "United Kingdom", email: "admin@ox.ac.uk", wallet: "0x8Ba1f109...d64DBA72", requestDate: "2024-01-12" },
  { id: 3, name: "National University of Singapore", country: "Singapore", email: "admin@nus.edu.sg", wallet: "0x9F4d96eC...2f3f8d6e", requestDate: "2024-01-13" },
];

export const mockRegisteredUniversities = [
  { id: 1, name: "Stanford University", country: "United States", status: "active", registeredDate: "2023-06-15", certificatesIssued: 1247, wallet: "0x1a2b3c4d...7q8r9s0t" },
  { id: 2, name: "MIT", country: "United States", status: "active", registeredDate: "2023-08-20", certificatesIssued: 892, wallet: "0x9s8r7q6p...4d3c2b1a" },
  { id: 3, name: "Cambridge University", country: "United Kingdom", status: "suspended", registeredDate: "2023-09-10", certificatesIssued: 543, wallet: "0xabcdef12...cdef1234" },
  { id: 4, name: "University of Tokyo", country: "Japan", status: "active", registeredDate: "2023-11-05", certificatesIssued: 678, wallet: "0x4567890a...4567890a" },
];

export const mockIssuedCertificates = [
  { id: 1, studentName: "John Doe", hash: "CERT123456", issueDate: "2024-05-13", status: "valid", degreeTitle: "Bachelor of Science in Computer Science", graduationDate: "2024-05-15" },
  { id: 2, studentName: "Jane Smith", hash: "CERT789012", issueDate: "2024-06-20", status: "revoked", degreeTitle: "Master of Engineering", graduationDate: "2023-06-20" },
  { id: 3, studentName: "Michael Johnson", hash: "CERT345678", issueDate: "2024-07-10", status: "valid", degreeTitle: "PhD in Data Science", graduationDate: "2024-07-10" },
  { id: 4, studentName: "Emily Davis", hash: "CERT901234", issueDate: "2024-08-05", status: "valid", degreeTitle: "Bachelor of Arts in Economics", graduationDate: "2024-08-05" },
];

export const mockUsers = {
  "admin@trustchain.com": { password: "password", role: "admin", name: "System Admin" },
  "admin@stanford.edu":   { password: "password", role: "university", name: "Stanford University" },
};
