from bson import ObjectId
from fastapi import APIRouter,Depends, HTTPException
from app.database import get_db
from app.models.university import UniversityCreate,UniversityResponse
from app.middleware.auth_middleware import require_university,require_admin
from datetime import datetime, timezone #to handle date and time
from app.routers.auth import hash_password
from web3 import Web3

router = APIRouter()

@router.post("/register")
async def register_university(university:UniversityCreate):
    db = get_db()
    exist_application = await db.applications.find_one({"email": university.email})
    if exist_application:
        raise HTTPException(status_code=400, detail="Application already exists")
    exist_university = await db.universities.find_one({"email": university.email})
    if exist_university:
        raise HTTPException(status_code=400, detail="University already exists")
    application = {
        "university_name": university.university_name,
        "country": university.country,
        "email": university.email,
        "hashed_password": hash_password(university.password),
        "status": "Pending",
        "register_date": datetime.now(timezone.utc),
        "role":"university",
        "total_certificates":0
    }
    await db.applications.insert_one(application)
    return {"message": "Application created successfully"}

#first o all application is applied to us (admin) and we approve it and then it is added to the universities collection
@router.get("/applications")
async def get_applications(current_user: dict=Depends(require_admin)):
    db = get_db()
    applications = await db.applications.find({"status":"Pending"}).to_list(length=100)
    if not applications:
        raise HTTPException(status_code=200, detail={"message":"No applications found"})
    for application in applications:
        application["_id"] = str(application["_id"])
    return applications

@router.put("/applications/{id}/reject")
async def reject_application(id:str,current_user: dict=Depends(require_admin)):
    db = get_db()
    application = await db.applications.find_one({"_id": ObjectId(id)})
    if not application:
        raise HTTPException(status_code=404, detail={"message":"Application not found"})
    await db.applications.update_one({"_id": ObjectId(id)}, {"$set": {"status": "Rejected"}})
    return {"message":"Application rejected"}

@router.put("/applications/{id}/approve")
async def approve_application(id:str,current_user: dict=Depends(require_admin)):
    db = get_db()
    application = await db.applications.find_one({"_id": ObjectId(id)})
    if not application:
        raise HTTPException(status_code=404, detail={"message":"Application not found"})
    university = {
        "university_name": application["university_name"],
        "country": application["country"],
        "email": application["email"],
        "hashed_password": application["hashed_password"],
        "status": "Approved",
        "register_date": datetime.now(timezone.utc),
        "role":"university",
        "wallet_address":None,
        "total_certificates":0
    }
    await db.universities.insert_one(university)
    await db.applications.delete_one({"_id": ObjectId(id)})
    return {"message":"Application approved"}
@router.get("/{id}")
async def get_university(id:str,current_user: dict=Depends(require_admin)):
    db = get_db()
    university = await db.universities.find_one({"_id": ObjectId(id)})
    if not university:
        raise HTTPException(status_code=404, detail={"message":"University not found"})
    university["_id"] = str(university["_id"])
    return university
@router.put("/{id}/suspend")
async def suspend_university(id:str,current_user: dict=Depends(require_admin)):
    db = get_db()
    university = await db.universities.find_one({"_id": ObjectId(id)})
    if not university:
        raise HTTPException(status_code=404, detail={"message":"University not found"})
    if university["status"] == "Suspended":
        raise HTTPException(status_code=400, detail={"message":"University is already suspended"})
    
    await db.universities.update_one({"_id": ObjectId(id)}, {"$set": {"status": "Suspended"}})
    return {"message":"University suspended successfully"}
@router.put("/{id}/reactivate")
async def reactivate_university(id:str,current_user: dict=Depends(require_admin)):
    db = get_db()
    university = await db.universities.find_one({"_id": ObjectId(id)})
    if not university:
        raise HTTPException(status_code=404, detail={"message":"University not found"})
    if university["status"] == "Active":
        raise HTTPException(status_code=400, detail={"message":"University is already active"})
    
    await db.universities.update_one({"_id": ObjectId(id)}, {"$set": {"status": "Active"}})
    return {"message":"University reactivated successfully"}

@router.put("/me/wallet")
async def register_wallet():
    current_user = Depends(require_university)
    db = get_db()

    if not register_wallet