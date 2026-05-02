from jose import jwt

from app.config import settings
from app.routers.auth import create_access_token, hash_password, verify_password


def test_hash_and_verify_password_roundtrip():
    raw = "secret123"
    hashed = hash_password(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("wrong", hashed) is False


def test_create_access_token_contains_payload():
    token = create_access_token({"sub": "user1", "email": "a@b.com", "role": "admin"})
    payload = jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )
    assert payload["sub"] == "user1"
    assert payload["email"] == "a@b.com"
    assert payload["role"] == "admin"
    assert "exp" in payload
