from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def verify_root():
    return {"message": "verify router is working"}
