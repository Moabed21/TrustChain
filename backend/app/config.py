from pydantic import field_validator
from pydantic_settings import BaseSettings
import json

class Settings(BaseSettings):
    APP_NAME: str = ""
    DEBUG: bool = True
    SECRET_KEY: str = ""
    MONGODB_URL: str = ""
    DATABASE_NAME: str = ""
    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = "" 
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
    CORS_ORIGINS: list[str] = []

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value):
        if isinstance(value, str):
            value = value.strip()
            # Try to parse as JSON array first (e.g. '["http://...", "http://..."]')
            if value.startswith("["):
                try:
                    return json.loads(value)
                except json.JSONDecodeError:
                    pass
            # Fallback: comma-separated list
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    class Config:
        env_file = ".env"

settings = Settings()
