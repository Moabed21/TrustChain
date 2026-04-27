from pydantic import BaseModel, EmailStr #base model for bases (classes)
 #connection , email str for email structure
from typing import Optional #to make something optional
from datetime import datetime, timezone #to handle date and time

class CertificateBase(BaseModel):  #every class in the db has them
    student_name:str
    major:str
    graduation_date:str
    university_id:str #university id is a string because it is a mongodb id which is a string like "abc123"

class CertificateCreate(CertificateBase): #event happen when Certificate is created ,adding password
    pass

class CertificateInDB(CertificateBase):   #what actually saved in mongodb
    id:Optional[str]=None #str because it is a mongodb id which is a string like "abc123"
    hashed_certificate:str
    enc_cid:str 
    qr_code:str #stored in base 64
    status:str #pending -> issued -> revoked
    issue_date:datetime=datetime.now(timezone.utc) #must be in utc timezone added to avoid timezone issues added it in import
    tx_hash:Optional[str] = None

class CertificateResponse(CertificateBase):#return values of timestamp and if (for confirmation)
    hashed_certificate:str
    issue_date:datetime
    qr_code:str
    status:str
    id:Optional[str]= None #str because it is a mongodb id which is a string like "abc123"

#basemodel has asequence like the sown above which consists in 4 bases (classes)