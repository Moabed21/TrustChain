from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, universities, certificates, verify, activities
from app.database import connect_db, close_db
from app.config import settings
from contextlib import asynccontextmanager
 
@asynccontextmanager
async def lifespan(app:FastAPI): # which manages the the startup and shutdown lifespan
    await connect_db()
    yield # means the server is running (similar to: while(true))
    await close_db()

app = FastAPI(
    title="TrustChain API",
    description="Blockchain-based Academic Certificate Verification",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Connect routers
app.include_router(auth.router,         prefix="/api/auth",         tags=["Auth"])
app.include_router(universities.router, prefix="/api/universities", tags=["Universities"])
app.include_router(certificates.router, prefix="/api/certificates", tags=["Certificates"])
app.include_router(verify.router,       prefix="/api/verify",       tags=["Verify"])
app.include_router(activities.router,   prefix="/api/activities",   tags=["Activities"])

@app.get("/")
async def root():
    return {"message": "TrustChain API is running"}
