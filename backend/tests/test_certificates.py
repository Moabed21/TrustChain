import pytest
from fastapi import HTTPException

from app.routers.certificates import parse_object_id


def test_parse_object_id_valid_certificate_id():
    oid = parse_object_id("507f1f77bcf86cd799439011", "certificate")
    assert str(oid) == "507f1f77bcf86cd799439011"


def test_parse_object_id_invalid_certificate_id():
    with pytest.raises(HTTPException) as exc:
        parse_object_id("bad-id", "certificate")
    assert exc.value.status_code == 400
    assert "Invalid certificate id format" in exc.value.detail
