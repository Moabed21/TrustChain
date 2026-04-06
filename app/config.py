from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "TrustChain"
    DEBUG: bool = True
    SECRET_KEY: str = "" #encryption seed
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "trustchain"
    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 #30 minutes 1448 is for testing =24hr
    POLYGON_RPC_URL: str = ""
    CONTRACT_ADDRESS: str = ""
    ADMIN_WALLET_ADDRESS: str = ""
    ADMIN_PRIVATE_KEY: str = ""
    PINATA_API_KEY: str = ""
    PINATA_SECRET_KEY: str = ""
    AES_SECRET_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
