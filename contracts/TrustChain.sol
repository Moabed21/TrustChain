// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TrustChain {
    //1) issue certificate (hash,encryptedCID) a function only callable by registered university
    //2) revoke certificate (hash) a function only callable by registered university
    //3) verify certificate (hash) a function callable by anyone to check if it is valid or revoked
    
    //a transaction is made by the university wallet ,each transaction has the certificate hash inside of it ,in the nonce of the transaction we put the student id
    //the hash of a certificate cant be duplicated so we use sha256 to make it unique

    //stored DATA onchain: 
    // 1) hash of the certificate
    // 2) encryptedCID
    // 3) university wallet
    // 4) timestamp
    // 5) isRevoked // status

    //offchain ashya
    // 1) student data : name , national id , major , gpa , graduation date , etc (stored on ipfs) //private data
    // 2) university profile : name , location , etc (stored on mongodb) //private data
    // 3) admin profile : name , location , etc (stored on mongodb) //private data
    // 
    //only the admin can register a university , map the university with its wallet
    //only the registered university can issue a certificate
    //only the registered university can revoke a certificate
    //anyone can verify a certificate
    //until 5 - april -2026 :
    // we had a discussion about the method of issuing in a two options :
    //the first: is to make a wallet for each university and the university will issue the certificate from its wallet
    //but we have a damn issue : how we can charge each damn wallet and make the damn transaction form each one ???
    // the second option is to make a single wallet an idiot admin wallet and the admin will issue the certificate from its wallet
    //but we have a damn issue : how we can charge each damn wallet and make the damn transaction form each one ???
    // ─── State Variables ───
    address public admin;                           // Admin address
    mapping(address => bool) public universities;   // Registered university wallets
    //mapping is an efficient way to store and retrieve data using a key-value pair
    //in this case the key is the certificate hash and the value is the certificate data

    struct Certificate {
        string encryptedCID;    // Encrypted IPFS CID
        address issuer;         // University wallet that issued it
        uint256 timestamp;      // When it was issued
        bool isRevoked;         // Revocation status
    }

    // certificate_hash => Certificate data
    mapping(bytes32 => Certificate) public certificates;
    // ─── Events (logs for frontend to listen to) ───
    event UniversityRegistered(address wallet);
    event CertificateIssued(bytes32 hash, address issuer);
    event CertificateRevoked(bytes32 hash);
    
    // ─── Constructor (runs once at deployment) ───
    constructor() {
        admin = msg.sender;  // Deployer becomes admin
    }
    
    // ─── Modifiers (access control) ───
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    modifier onlyUniversity() {
        require(universities[msg.sender], "Only registered university");
        _;
    }
    
    // ─── Functions ───
    
    // Admin registers an approved university's wallet
    function registerUniversity(address wallet) external onlyAdmin {
        universities[wallet] = true;
        emit UniversityRegistered(wallet);
    }
    
    // University issues a certificate
    function issueCertificate(
        bytes32 certHash, 
        string calldata encCID
    ) external onlyUniversity {
        require(certificates[certHash].timestamp == 0, "Already exists");
        certificates[certHash] = Certificate(encCID, msg.sender, block.timestamp, false);
        emit CertificateIssued(certHash, msg.sender);
    }
    
    // University revokes a certificate it issued
    function revokeCertificate(bytes32 certHash) external onlyUniversity {
        require(certificates[certHash].issuer == msg.sender, "Not your certificate");
        require(!certificates[certHash].isRevoked, "Already revoked");
        certificates[certHash].isRevoked = true;
        emit CertificateRevoked(certHash);
    }
    
    // Anyone can verify a certificate (public)
    function verifyCertificate(bytes32 certHash) external view returns (
        bool exists,
        string memory status,
        address issuer,
        uint256 timestamp
    ) {
        Certificate memory cert = certificates[certHash];
        if (cert.timestamp == 0) return (false, "invalid", address(0), 0);
        string memory s = cert.isRevoked ? "revoked" : "valid";
        return (true, s, cert.issuer, cert.timestamp);
    }
}
