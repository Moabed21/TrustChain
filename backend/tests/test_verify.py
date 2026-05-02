from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.routers import verify as verify_router


def _build_client():
    app = FastAPI()
    app.include_router(verify_router.router, prefix="/api/verify")
    return TestClient(app)


def test_verify_health_check():
    client = _build_client()
    response = client.get("/api/verify")
    assert response.status_code == 200
    assert response.json()["message"] == "verify router is working"


def test_verify_by_file_success(monkeypatch):
    client = _build_client()

    async def fake_verify(cert_hash):
        assert cert_hash
        return {"status": "VALID", "issuer": "0xissuer", "timestamp": 123}

    monkeypatch.setattr(verify_router, "verify_certificate_on_chain", fake_verify)

    response = client.post(
        "/api/verify/file",
        files={"pdf": ("cert.pdf", b"fake-pdf-content", "application/pdf")},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "VALID"
    assert body["issuer"] == "0xissuer"


def test_verify_by_qr_success(monkeypatch):
    client = _build_client()

    monkeypatch.setattr(verify_router, "decode_qr", lambda *_: "encrypted-cid")
    monkeypatch.setattr(verify_router, "decrypt_cid", lambda *_: "plain-cid")

    async def fake_fetch(_cid):
        return "encrypted-pdf-str"

    monkeypatch.setattr(verify_router, "fetch_from_ipfs", fake_fetch)
    monkeypatch.setattr(verify_router, "decrypt_pdf", lambda *_: b"pdf-bytes")

    async def fake_verify(_hash):
        return {"status": "REVOKED", "issuer": "0xissuer", "timestamp": 999}

    monkeypatch.setattr(verify_router, "verify_certificate_on_chain", fake_verify)

    response = client.post(
        "/api/verify/qr",
        files={"qr_image": ("qr.png", b"img-bytes", "image/png")},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "REVOKED"
