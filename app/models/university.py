from pydantic import BaseModel, EmailStr #base model for bases (classes)
 #connection , email str for email structure
from typing import Optional #to make something optional
from datetime import datetime, timezone #to handle date and time

class UniversityBase(BaseModel):  #every class in the db has them
    university_name:str
    country:str
    official_email:EmailStr

class UniversityCreate(UniversityBase): #event happen when University is created ,adding password
    password:str

class UniversityInDB(UniversityBase):   #what actually saved in mongodb
    id:Optional[str]=None #str because it is a mongodb id which is a string like "abc123"
    status:str="Pending"
    hashed_password:str
    register_date:datetime=datetime.now(timezone.utc) #must be in utc timezone added to avoid timezone issues added it in import
    wallet_address:str

class UniversityResponse(UniversityBase):#return values of timestamp and if (for confirmation)
    register_date:datetime
    status:str
    total_certificates:int
    id:Optional[str]= None #str because it is a mongodb id which is a string like "abc123"

#basemodel has asequence like the sown above which consists in 4 bases (classes)