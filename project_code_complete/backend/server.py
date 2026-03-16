from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key')
ALGORITHM = "HS256"
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Models
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    role: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ComplaintCreate(BaseModel):
    student_name: str
    category: Optional[str] = None
    location: str
    description: str

class Complaint(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_name: str
    student_id: str
    category: str
    location: str
    description: str
    ai_category: Optional[str] = None
    priority: Optional[str] = None
    summary: Optional[str] = None
    status: str = "Pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    category: Optional[str] = None

class AnalyticsResponse(BaseModel):
    total_complaints: int
    pending_count: int
    in_progress_count: int
    resolved_count: int
    category_breakdown: dict
    priority_breakdown: dict
    location_breakdown: dict

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

async def analyze_complaint_with_ai(description: str, category: Optional[str] = None) -> dict:
    """Analyze complaint using Gemini 3 Flash"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are a complaint analysis assistant. Analyze complaints and provide structured output."
        ).with_model("gemini", "gemini-3-flash-preview")
        
        prompt = f"""Analyze this complaint and provide a JSON response with the following fields:
- category: One of [Electrical, Cleaning, Internet, Maintenance, Other]
- priority: One of [Low, Medium, High]
- summary: A brief one-line summary (max 80 characters)

Complaint: {description}

Respond ONLY with valid JSON, no markdown or additional text."""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        # Try to parse JSON from response
        import json
        response_text = response.strip()
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]
        
        analysis = json.loads(response_text.strip())
        return {
            "ai_category": analysis.get("category", "Other"),
            "priority": analysis.get("priority", "Medium"),
            "summary": analysis.get("summary", description[:80])
        }
    except Exception as e:
        logger.error(f"AI analysis error: {e}")
        return {
            "ai_category": category or "Other",
            "priority": "Medium",
            "summary": description[:80]
        }

async def find_duplicate_complaints(description: str, location: str) -> List[dict]:
    """Find similar complaints using simple text matching"""
    try:
        all_complaints = await db.complaints.find({}, {"_id": 0}).to_list(1000)
        duplicates = []
        
        desc_words = set(description.lower().split())
        
        for complaint in all_complaints:
            comp_words = set(complaint['description'].lower().split())
            similarity = len(desc_words.intersection(comp_words)) / max(len(desc_words), len(comp_words))
            
            if similarity > 0.5 and complaint['location'] == location:
                duplicates.append({
                    "id": complaint['id'],
                    "description": complaint['description'],
                    "similarity": round(similarity * 100)
                })
        
        return duplicates[:5]
    except Exception as e:
        logger.error(f"Duplicate detection error: {e}")
        return []

# Auth routes
@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = hash_password(user_data.password)
    user = User(
        name=user_data.name,
        email=user_data.email,
        role=user_data.role
    )
    
    doc = user.model_dump()
    doc['password'] = hashed_pw
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    
    token = create_access_token({"sub": user.id, "role": user.role})
    return {"token": token, "user": user.model_dump()}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_doc.pop('password', None)
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**user_doc)
    token = create_access_token({"sub": user.id, "role": user.role})
    return {"token": token, "user": user.model_dump()}

@api_router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Complaint routes
@api_router.post("/complaints", response_model=Complaint)
async def create_complaint(complaint_data: ComplaintCreate, current_user: User = Depends(get_current_user)):
    # Analyze with AI
    ai_analysis = await analyze_complaint_with_ai(
        complaint_data.description,
        complaint_data.category
    )
    
    complaint = Complaint(
        student_name=complaint_data.student_name,
        student_id=current_user.id,
        category=complaint_data.category or ai_analysis['ai_category'],
        location=complaint_data.location,
        description=complaint_data.description,
        ai_category=ai_analysis['ai_category'],
        priority=ai_analysis['priority'],
        summary=ai_analysis['summary']
    )
    
    doc = complaint.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.complaints.insert_one(doc)
    
    # Check for duplicates
    duplicates = await find_duplicate_complaints(complaint_data.description, complaint_data.location)
    
    return complaint

@api_router.get("/complaints", response_model=List[Complaint])
async def get_complaints(current_user: User = Depends(get_current_user)):
    query = {} if current_user.role == "admin" else {"student_id": current_user.id}
    complaints = await db.complaints.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for complaint in complaints:
        if isinstance(complaint.get('created_at'), str):
            complaint['created_at'] = datetime.fromisoformat(complaint['created_at'])
        if isinstance(complaint.get('updated_at'), str):
            complaint['updated_at'] = datetime.fromisoformat(complaint['updated_at'])
    
    return complaints

@api_router.get("/complaints/{complaint_id}", response_model=Complaint)
async def get_complaint(complaint_id: str, current_user: User = Depends(get_current_user)):
    complaint = await db.complaints.find_one({"id": complaint_id}, {"_id": 0})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    if isinstance(complaint.get('created_at'), str):
        complaint['created_at'] = datetime.fromisoformat(complaint['created_at'])
    if isinstance(complaint.get('updated_at'), str):
        complaint['updated_at'] = datetime.fromisoformat(complaint['updated_at'])
    
    return Complaint(**complaint)

@api_router.put("/complaints/{complaint_id}")
async def update_complaint(complaint_id: str, update_data: ComplaintUpdate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    complaint = await db.complaints.find_one({"id": complaint_id}, {"_id": 0})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.complaints.update_one({"id": complaint_id}, {"$set": update_dict})
    
    updated = await db.complaints.find_one({"id": complaint_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    
    return Complaint(**updated)

@api_router.get("/complaints/{complaint_id}/duplicates")
async def get_duplicates(complaint_id: str, current_user: User = Depends(get_current_user)):
    complaint = await db.complaints.find_one({"id": complaint_id}, {"_id": 0})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    duplicates = await find_duplicate_complaints(complaint['description'], complaint['location'])
    return {"duplicates": duplicates}

@api_router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    complaints = await db.complaints.find({}, {"_id": 0}).to_list(10000)
    
    total = len(complaints)
    pending = sum(1 for c in complaints if c['status'] == 'Pending')
    in_progress = sum(1 for c in complaints if c['status'] == 'In Progress')
    resolved = sum(1 for c in complaints if c['status'] == 'Resolved')
    
    category_breakdown = {}
    for c in complaints:
        cat = c.get('ai_category', c.get('category', 'Other'))
        category_breakdown[cat] = category_breakdown.get(cat, 0) + 1
    
    priority_breakdown = {}
    for c in complaints:
        pri = c.get('priority', 'Medium')
        priority_breakdown[pri] = priority_breakdown.get(pri, 0) + 1
    
    location_breakdown = {}
    for c in complaints:
        loc = c['location']
        location_breakdown[loc] = location_breakdown.get(loc, 0) + 1
    
    # Get top 5 locations
    top_locations = dict(sorted(location_breakdown.items(), key=lambda x: x[1], reverse=True)[:5])
    
    return AnalyticsResponse(
        total_complaints=total,
        pending_count=pending,
        in_progress_count=in_progress,
        resolved_count=resolved,
        category_breakdown=category_breakdown,
        priority_breakdown=priority_breakdown,
        location_breakdown=top_locations
    )

@api_router.get("/")
async def root():
    return {"message": "Smart Complaint Portal API"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()