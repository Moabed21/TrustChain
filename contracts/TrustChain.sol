// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
// the way and version that the contract will be compiled with

//the structure of the contract
contract TrustChain {
    //state var
    //this are the variables that lives in BC forever
    address private admin;
    struct Certificate {
        string encryptedCID;
        //the IPFS encrypted CID AES-256-GCM
        address issuer;
        //the address of the university that issued it
        uint256 timestamp;
        //to get time of issuance
        bool isRevoked;
        //to check if it is revoked
        bool exist;
        //to check if it fake at all
    }
    mapping(bytes32 => Certificate) private certificates;
    /*
mapping is same as dict in python 
key used byte32 because the hash of the certificate data is sha 256 and converted to byte in python backend
the values come from Certificate struct 
private so not anyone got the encrypted cid
who can write with it issue certificate to add and revoke certificate  to flip the bool is revoked
who read verify certificate only
*/
    mapping(address => bool) public registeredUniversities;
    /*key address of the uni wallet
values is true or false based if it exist or not
who write only admin
who read anyone
public to let solidity generate the getter function 
getter function is just a fetch function*/

    //events
    // events are functions that run on blockchain its used to log what happens in the transaction reciept just like print() in python

    event UniversityRegistered(address indexed wallet);
    //used when admin registers new university
    //indexed make that field searchable in logs without it, the search will be more more expensive and time consumer
    event CertificateIssued(
        bytes32 indexed certificateHash,
        address indexed issuer
    );
    //used when a university issued new certificate
    event CertificateRevoked(
        bytes32 indexed certificateHash,
        address indexed revokedBy
    );
    //used when a university revoked a certificate

    //modifiers
    //modifiers are require functions but instead of repeating it everytime use the modifier
    modifier onlyAdmin() {
        require(msg.sender == admin, "caller is not admin rejected call");
        //require takes 2 parameters the condition and the message that return if the condition false
        //msg sender is global var always is the wallet address that sent the tx and it is injected by solidity automatically
        //

        _;
        // this _; is a place holder to continue running the function that call modifier but modifer firstly
    }
    //this modifier to check the caller is admin or not
    modifier onlyUniversity() {
        require(
            registeredUniversities[msg.sender],
            "caller is not university rejected call"
        );
        //registered uni its type is bool so no need to use == true or uni it does the work
        _;
    }
    //this modifier to check the caller is university or not

    //constructor

    constructor() {
        admin = msg.sender;
    }

    function registerUniversity(address wallet) external onlyAdmin {
        //external means the function can be called only from outside the contract used due to it is cheaper than public and not used internally by other functions
        //it uses the modifier onlyAdmin so if not admin dont make the tx so no gas fees lost
        require(wallet != address(0), "TrustChain: invalid wallet address");
        //address(0) means null or empty address so if by mistake the tx was without address refuse it
        require(
            !registeredUniversities[wallet],
            "TrustChain: university already registered"
        );
        //if the address already registered refuse it
        registeredUniversities[wallet] = true;
        //if all the above is true then register the university
        //this costs gas fees
        emit UniversityRegistered(wallet);
        //it logs the registration using the event above line 42
    }
    function issueCertificate(
        bytes32 certHash,
        string memory encryptedCID
    ) external onlyUniversity {
        //memory means it saved during function called only(temproraly) cheaper than storage for temp values

        require(certHash != bytes32(0), "invalid certificate hash");
        //to check hash is not empty
        require(bytes(encryptedCID).length > 0, "invalid certificate cid");
        //to check CID is not empty
        require(!certificates[certHash].exist, "certificate already issued");
        //check if the the cert is already issued reject duplicate
        certificates[certHash] = Certificate({
            encryptedCID: encryptedCID,
            issuer: msg.sender,
            timestamp: block.timestamp,
            isRevoked: false,
            // by default the cert is not revoked
            exist: true
        });

        emit CertificateIssued(certHash, msg.sender);
    }
    function revokeCertificate(bytes32 certHash) external onlyUniversity {
        require(certificates[certHash].exist, "certificate not found");
        //check if it is exist we can remove something doesnt exist
        require(certificates[certHash].issuer == msg.sender, "unauthorized");
        //check if who try to revoke is the issuer university
        require(
            certificates[certHash].isRevoked == false,
            "certificate already revoked"
        );
        //check if the cert is already revoked
        certificates[certHash].isRevoked = true;
        //if all the above is true then revoke the cert
        emit CertificateRevoked(certHash, msg.sender);
        //log the revoction
    }
    function verifyCertificate(
        bytes32 certHash
    )
        external
        view
        returns (bool exist, bool isRevoked, address issuer, uint256 timestamp)
    {
        //used view so nothing can be edited
        //used returns so no private data such encryptedCID leaked so return 4 values only

        Certificate memory cert = certificates[certHash];
        //load the struct temp here using memory
        return (cert.exist, cert.isRevoked, cert.issuer, cert.timestamp);
        //return the values so in backend check it and return fake revoked or data based on its status
    }
    function isUniversityRegistered(
        address wallet
    ) external view returns (bool) {
        //check if the wallet is registered using universityregistered event
        return registeredUniversities[wallet];
    }
    function getAdmin() external view returns (address) {
        //return admin's wallet address it is not a secret for transparency
        return admin;
    }
}
//sorry moath for that but i wrote it🙃🙃