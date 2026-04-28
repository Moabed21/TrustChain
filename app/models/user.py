from pydantic import BaseModel, EmailStr #base model for bases (classes)
 #connection , email str for email structure
from typing import Optional #to make something optional
from datetime import datetime, timezone #to handle date and time

class UserBase(BaseModel):#every class in the db has them
    email:EmailStr #email is a string but it is validated by email-validator
    role:str

class UserCreate(UserBase):#event happen when user is created ,adding password
    password:str

class UserInDB(UserBase):#what actually saved in mongodb
    id:Optional[str]=None #str because it is a mongodb id which is a string like "abc123"
    hashed_password:str
    create_date:datetime=datetime.now(timezone.utc) #must be in utc timezone added to avoid timezone issues added it in import

class UserResponse(UserBase):#return values of timestamp and if (for confirmation)
    create_date:datetime
    id:Optional[str]= None #str because it is a mongodb id which is a string like "abc123"

#this made for seperation between admin and university based on role