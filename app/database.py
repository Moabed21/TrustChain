from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client:AsyncIOMotorClient= None # client is the connection to the database
db = None # db is the database
async def connect_db():
    global client, db # global variables to be used in the database
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME] 
    await db.users.create_index("email", unique=True)
    await db.universities.create_index("email", unique=True)
    await db.universities.create_index("wallet_address", unique=True)
    await db.certificates.create_index("certificate_hash", unique=True)
    await db.applications.create_index("email", unique=True)
    print("Connected to MongoDB")
    print("Indexes created")

async def close_db():
    global client
    if client:
        client.close()
        print("Disconnected from MongoDB")

def get_db():
    return db
