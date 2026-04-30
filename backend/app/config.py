from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = ""
    DEBUG: bool = True
    SECRET_KEY: str = "" #encryption seed
    MONGODB_URL: str = ""
    DATABASE_NAME: str = ""
    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = "" #no need here moved to the env
    POLYGON_RPC_URL: str = ""
    CONTRACT_ADDRESS: str = ""
    ADMIN_WALLET_ADDRESS: str = ""
    ADMIN_PRIVATE_KEY: str = ""
    FUNDING_AMOUNT: int = ""
    PINATA_API_KEY: str = ""
    PINATA_SECRET_KEY: str = ""
    PINATA_JWT_KEY: str = ""
    AES_SECRET_KEY: str = ""
    CHAIN_ID : int = ""
    GAS : int = ""
    class Config:
        env_file = ".env"

settings = Settings()
