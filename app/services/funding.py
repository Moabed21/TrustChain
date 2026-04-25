from app.config import Settings
import models.university
from web3 import Web3

# we need the login , to import the just created wallet by the logged university

def get_connection() -> Web3:
    w3 = Web3(Web3.HTTPProvider(Settings.POLYGON_RPC_URL))
    if not w3.is_connected():
        raise ConnectionError("Can't connect to rpc")
    return w3
async def fund(wallet_address:str) -> str:
    #take small amount of our MONEY(polygon) to university wallet just created this function returns transaction id (str) 
    w3 = get_connection()
    
    if not Web3.is_address(wallet_address) :
        raise ValueError("Invalid Wallet address")
    checksum_address= Web3.to_checksum_address(wallet_address)
    funder_wallet = w3.eth.account.from_key(Settings.ADMIN_PRIVATE_KEY)  
    gas_price = w3.eth.gas_price
    nonce = w3.eth.get_transaction_count(funder_wallet.address)
    transaction = {
        "nonce" = nonce,
        "to" = checksum_address,
        "value" = Settings.FUNDING_AMOUNT,
        "gas" = Settings.GAS, #hardcoded from eth yellowpapar to encapsulate transaction fee required
        "chain_id" = Settings.CHAIN_ID,
        "gas_price" = gas_price,
    }
    signed_tx = w3.eth.account.sign_transaction(transaction,funder_wallet.key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    tx_hash_hex = tx_hash.hex()
    print("succeeeeeeed")
    return tx_hash_hex