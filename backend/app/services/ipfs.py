import httpx
from app.config import settings


_PINATA_UPLOAD_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS"
#this is pinata rest api endpoint to pin a file to IPFS
_IPFS_GATEWAY_URL = "https://gateway.pinata.cloud/ipfs"
#this is pinata gateway to fetch a file from IPFS using its CID

def _pinata_headers() -> dict:
    return {
        "pinata_api_key": settings.PINATA_API_KEY,
        "pinata_secret_api_key": settings.PINATA_SECRET_KEY,
    }
#helper function to retrieve the auth keys for pinata from the environment variables made as a dict to be structered and reusable

async def upload_to_ipfs(encrypted_pdf: str) -> str:
  #this function takes the encrypted pdf string as input base64url encoded and uploads it to ipfs and return the CID as a string
    file_bytes = encrypted_pdf.encode("utf-8")
#encode the string of pdf (base64url encoded) to bytes using utf-8 encoding to be sent to ipfs (pinata)
    async with httpx.AsyncClient() as client:
        #async with is to automatically close the client after the request is done
        #async client is used because we are using async def and need to send requests asynchronously
        response = await client.post(
            _PINATA_UPLOAD_URL, #pinata endpoint
            headers=_pinata_headers(), #auth keys headers
            files={ 
                #this is how we upload a file to ipfs, 'file' is the form field name, 'certificate.enc' is the file name, file_bytes is the file content and application/octet-stream is the file type
                
                "file": ("certificate.enc", file_bytes, "application/octet-stream") 
            },
            timeout=30.0,   #if it takes more than 30 seconds to upload to ipfs it will give timeout error
        )

    if response.status_code != 200:
        raise RuntimeError(f"Pinata upload failed [{response.status_code}]: {response.text}")
    #if the response is not 200 it will raise an error with the status code and the response text
    cid = response.json()["IpfsHash"]
    return cid
    #parse the response and return the IPFS hash into python dict with only extracted ipfs hash 

async def fetch_from_ipfs(cid: str) -> str:
   #takes plain text cid and return the base64url encoded encrypted pdf as a string 
    url = f"{_IPFS_GATEWAY_URL}/{cid}"
#build the url for the gateway by concatenating the gateway url and the cid 
    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            timeout=30.0,   #if it takes more than 30 seconds to fetch from ipfs it will give timeout error
        )

    if response.status_code != 200:
        raise RuntimeError(f"IPFS fetch failed [{response.status_code}]: {response.text}")
    #if the response is not 200 it will raise an error with the status code and the response text
    return response.text #it is the base64url encoded encrypted pdf as a string
