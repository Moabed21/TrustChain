from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def certificates_root():
    return {"message": "certificates router is working"}
