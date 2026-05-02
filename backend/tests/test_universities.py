import pytest
from fastapi import HTTPException

from app.routers.universities import parse_object_id


def test_parse_object_id_valid_university_id():
    oid = parse_object_id("507f1f77bcf86cd799439011", "university")
    assert str(oid) == "507f1f77bcf86cd799439011"


def test_parse_object_id_invalid_university_id():
    with pytest.raises(HTTPException) as exc:
        parse_object_id("not-a-valid-oid", "university")
    assert exc.value.status_code == 400
    assert "Invalid university id format" in exc.value.detail["message"]
