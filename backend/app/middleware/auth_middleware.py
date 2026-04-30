from bson import ObjectId
#for mongodb storage because it uses bson unlike the server which uses json ,to translate between them
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException
from jose import JWTError, jwt
from app.config import settings
from app.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")
#this is used to tell the function that this is not a query parameter , its a bearer token
async def get_current_user(token: str  = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        #chech the validity of the token 
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        user = await db.universities.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception
    return user

def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def require_university(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "university":
        raise HTTPException(status_code=403, detail="University access required")
    return current_user