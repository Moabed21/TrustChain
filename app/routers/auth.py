from app.middleware.auth_middleware import get_current_user
from fastapi import APIRouter, HTTPException, Depends
# APIRouter creates a router 
# HTTPException return error responses like 401, 404
# Depends lets us inject dependencies into endpoints
# this is a built in FastAPI class that reads
# username and password from the request body
# it expects form data (not JSON) with fields:
# username and password
from datetime import datetime, timedelta, timezone
# datetime   for working with dates and times
# timedelta  for adding time (like "add 30 minutes")
# timezone   for timezone awareness (utc)
from jose import jwt
# jose is a library for working with JWT tokens
# jwt to encode and decode tokens
# JWTError  error class if token is invalid
from fastapi.security import OAuth2PasswordRequestForm
# OAuth2PasswordRequestForm is a built in FastAPI class that reads username and password from the request body
# it expects form data (not JSON) with fields: username and password
from app.database import get_db
# our function that returns the MongoDB database object
from app.config import settings
# our settings object that reads from .env file
from typing import Annotated
# Annotated is a built in FastAPI class that allows us to annotate the type of the parameter
import bcrypt
# bcrypt is a password hashing library
router = APIRouter()
# creates a router object from the APIRouter class
def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")
# hash the password using the bcrypt algorithm the output is a string of characters hashed version of the password stored in the database
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )
# verify the password using the bcrypt algorithm the output is a boolean True or False takes the plain password and the hashed password as input and returns True or False
def create_access_token(data: dict) -> str:
    payload = data.copy()
    #makes a copy of the data dictionary to avoid modifying the original dictionary
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    #calculates the expiration time by adding the access token expire minutes to the current time in utc timezone
    payload.update({"exp": expire})
    #add exp key to the dictionary with the expiration time "exp" is JWT standard for expiration time
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    #encode the payload using the jwt library and return the encoded token the algo is the JWT ALGORITHM from settings in config.py right now it is HS256
@router.post("/login")  # pyright: ignore[reportUnreachable]
    #creates an endpoint for the login route using POST because we are sending data to the server (username and password)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
#async because FASTAPI works Asyncronously, form_data automatically reads username and password from the request body, Depends() tells FASTAPI to run OAuth2PasswordRequestForm and inject the result into the form_data parameter
    db = get_db()
        # gets the database object from the database module
    user = await db.users.find_one({"email": form_data.username})
        #finds the user in the database with the email provided in the form data find_one is a mongodb method that returns the first document that matches the query used because admins is here
    if not user:
        user = await db.universities.find_one({"email": form_data.username})
        #if the not found in users collection then checks if the user is found in the universities collection
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        # if still not found in either collection return 401 Unauthorized error we say "email or password" not "email not found" so attackers don't know which one was wrong (better security level)
    if user.get("status") == "Pending":
        raise HTTPException(status_code=403, detail="Account is pending approval")
        # if the account is pending approval return 403 not approved yet
    if user.get("status") == "Suspended":
        raise HTTPException(status_code=403, detail="Account is suspended")
        # if the account is suspended return 403 account is suspended
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        # if the password is not correct return 401 Unauthorized error with same message as above for better security level
    token = create_access_token({"sub": str(user["_id"]),"email": user["email"],"role": user["role"],"wallet_address": user.get("wallet_address", None)})
        # sub is the subject of the token which is the user's MongoDB ID sub is standard JWT field email is the email of the user role is the role of the user str() because MongoDB ID is an ObjectId objectJWT needs a plain string wallet_address is the wallet address of the user if it is not found then it is None
    return {"access_token": token, "token_type": "bearer", "role": user["role"] , "email": user["email"]}
        # return the token and the token type "bearer" is the standard token type for JWT token that is used to authenticate the user and send with each request to the server to verify the user is authenticated in the frontend in the future requests role is the role of the user email is the email of the user 

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": str(current_user["_id"]),
        "email": current_user["email"],
        "role": current_user["role"],
        "status": current_user.get("status",None),
        "wallet_address": current_user.get("wallet_address",None)
    }
@router.post("/logout")
async def logout():
    return {"message": "Logout successful"}
