from app.config import settings
from web3 import Web3

# we need the login , to import the just created wallet by the logged university

def get_connection() -> Web3:
    w3 = Web3(Web3.HTTPProvider(settings.POLYGON_RPC_URL))
    if not w3.is_connected():
        raise ConnectionError("Can't connect to rpc")
    return w3
async def fund(wallet_address:str) -> str:
    #take small amount of our MONEY(polygon) to university wallet just created this function returns transaction id (str)
    w3 = get_connection()
    if not Web3.is_address(wallet_address) :
        raise ValueError("Invalid Wallet address")
    checksum_address= Web3.to_checksum_address(wallet_address)
    #--------getting the funder (us) data ready--
    funder_wallet = w3.eth.account.from_key(settings.ADMIN_PRIVATE_KEY)  
    gas_price = w3.eth.gas_price
    nonce = w3.eth.get_transaction_count(funder_wallet.address)
    #--------data is ready-----------------------
    #--------building the transaction structure--
    transaction = {
        "nonce" : nonce,
        "to" : checksum_address,
        "value" : settings.FUNDING_AMOUNT,
        "gas" : settings.GAS, #hardcoded from eth yellowpapar to encapsulate transaction fee required
        "chainId" : settings.CHAIN_ID,
        "gasPrice" : gas_price,
    }
    signed_tx = w3.eth.account.sign_transaction(transaction,funder_wallet.key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    print(f"transaction sent! Hash: {tx_hash.hex()}")
    #to ensure the transaction is done
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    if receipt.status == 1:
        print("Success: Wallet funded!")
    else:
        raise Exception("Transaction failed on blockchain")
    return tx_hash.hex()