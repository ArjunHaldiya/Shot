from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import json
import os
import uuid
import shutil

# Initialize FastAPI app
app = FastAPI(title="Shot - Party & Mood API")

# CORS - allows frontend to talk to backend
# This is CRITICAL for React to communicate with Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://shot-black.vercel.app"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models (Pydantic) - defines the structure of our data
class MoodAnswers(BaseModel):
    """User's answers to mood questions"""
    answers: List[int]  # List of answer indices
    preference: str  # "cocktails", "hard", "soft"

class PartyCreate(BaseModel):
    """Data needed to create a party"""
    host_name: str
    duration_hours: int

class PartyJoin(BaseModel):
    """Data needed to join a party"""
    user_name: str

# In-memory storage (we'll use files later for persistence)
parties = {}  # party_code -> party_data
photos = {}   # party_code -> list of photo paths

# Create directories for storage
os.makedirs("data/parties", exist_ok=True)
os.makedirs("data/photos", exist_ok=True)

# ==================== MOOD DETECTION ====================

MOOD_QUESTIONS = [
    {
        "id": 1,
        "question": "How's your energy level right now?",
        "options": ["Exhausted 😴", "Chill 😌", "Energetic ⚡", "HYPED 🚀"]
    },
    {
        "id": 2,
        "question": "What's your social vibe?",
        "options": ["Solo mode 🎧", "Small group 👥", "Party time 🎉", "Dance floor 💃"]
    },
    {
        "id": 3,
        "question": "How adventurous are you feeling?",
        "options": ["Play it safe 🛡️", "Slightly curious 🤔", "Ready to explore 🗺️", "Full risk-taker 🎲"]
    },
    {
        "id": 4,
        "question": "What flavor profile sounds good?",
        "options": ["Sweet 🍬", "Fruity 🍓", "Bitter/Complex 🍃", "Strong & Bold 💪"]
    },
    {
        "id": 5,
        "question": "What's the occasion?",
        "options": ["Casual hangout 🏠", "Celebration 🎊", "Need to unwind 🧘", "Let's get wild 🎪"]
    }
]

# Drink database with mood scores
DRINKS = {
    "cocktails": [
        {
            "name": "Mojito",
            "description": "Refreshing mint and lime",
            "mood_match": [2, 2, 1, 2, 1],
            "icon": "🌿",
            "color": "from-green-400 to-emerald-600",
            "brands": ["Bacardi White Rum", "Havana Club"],
            "strength": 6,
            "sweetness": 7,
            "complexity": 5,
            "abv": "10-15%",
            "rarity": "common"
        },
        {
            "name": "Margarita",
            "description": "Classic lime tequila cocktail",
            "mood_match": [2, 3, 2, 2, 2],
            "icon": "🍋",
            "color": "from-yellow-400 to-lime-600",
            "brands": ["Jose Cuervo", "Patron Silver"],
            "strength": 7,
            "sweetness": 6,
            "complexity": 6,
            "abv": "15-20%",
            "rarity": "common"
        },
        {
            "name": "Old Fashioned",
            "description": "Sophisticated whiskey classic",
            "mood_match": [1, 1, 2, 3, 1],
            "icon": "🥃",
            "color": "from-amber-600 to-orange-800",
            "brands": ["Maker's Mark", "Bulleit Bourbon"],
            "strength": 9,
            "sweetness": 4,
            "complexity": 8,
            "abv": "25-30%",
            "rarity": "rare"
        },
        {
            "name": "Piña Colada",
            "description": "Tropical coconut paradise",
            "mood_match": [2, 2, 1, 1, 2],
            "icon": "🥥",
            "color": "from-yellow-300 to-amber-500",
            "brands": ["Malibu Rum", "Captain Morgan"],
            "strength": 5,
            "sweetness": 9,
            "complexity": 4,
            "abv": "10-15%",
            "rarity": "common"
        },
        {
            "name": "Espresso Martini",
            "description": "Coffee kick with vodka",
            "mood_match": [3, 2, 2, 3, 2],
            "icon": "☕",
            "color": "from-amber-900 to-stone-950",
            "brands": ["Grey Goose", "Kahlua"],
            "strength": 8,
            "sweetness": 6,
            "complexity": 7,
            "abv": "20-25%",
            "rarity": "epic"
        },
        {
            "name": "Long Island Iced Tea",
            "description": "Strong mix that packs a punch",
            "mood_match": [3, 3, 3, 3, 3],
            "icon": "⚡",
            "color": "from-orange-600 to-red-700",
            "brands": ["Multiple spirits mix"],
            "strength": 10,
            "sweetness": 7,
            "complexity": 9,
            "abv": "20-28%",
            "rarity": "legendary"
        },
    ],
    "hard": [
        {
            "name": "Vodka",
            "description": "Clean and versatile",
            "mood_match": [2, 2, 2, 2, 2],
            "icon": "❄️",
            "color": "from-blue-400 to-cyan-600",
            "brands": ["Grey Goose", "Absolut", "Tito's"],
            "strength": 10,
            "sweetness": 1,
            "complexity": 3,
            "abv": "40%",
            "rarity": "common"
        },
        {
            "name": "Whiskey",
            "description": "Smooth and warming",
            "mood_match": [1, 1, 2, 3, 1],
            "icon": "🥃",
            "color": "from-amber-700 to-orange-900",
            "brands": ["Jack Daniel's", "Johnnie Walker", "Jameson"],
            "strength": 10,
            "sweetness": 2,
            "complexity": 9,
            "abv": "40-50%",
            "rarity": "rare"
        },
        {
            "name": "Tequila",
            "description": "Bold and spirited",
            "mood_match": [3, 3, 3, 2, 3],
            "icon": "🌵",
            "color": "from-lime-500 to-green-700",
            "brands": ["Jose Cuervo", "Patron", "Don Julio"],
            "strength": 10,
            "sweetness": 2,
            "complexity": 7,
            "abv": "38-40%",
            "rarity": "epic"
        },
        {
            "name": "Rum",
            "description": "Sweet and tropical",
            "mood_match": [2, 2, 1, 2, 2],
            "icon": "🏴‍☠️",
            "color": "from-amber-500 to-yellow-700",
            "brands": ["Captain Morgan", "Bacardi", "Malibu"],
            "strength": 9,
            "sweetness": 5,
            "complexity": 6,
            "abv": "37-40%",
            "rarity": "common"
        },
        {
            "name": "Gin",
            "description": "Botanical and complex",
            "mood_match": [2, 1, 2, 3, 1],
            "icon": "🌿",
            "color": "from-emerald-400 to-teal-700",
            "brands": ["Bombay Sapphire", "Tanqueray", "Hendrick's"],
            "strength": 9,
            "sweetness": 1,
            "complexity": 8,
            "abv": "40-47%",
            "rarity": "rare"
        },
    ],
    "soft": [
        {
            "name": "Beer (Lager)",
            "description": "Light and crisp",
            "mood_match": [1, 2, 1, 1, 1],
            "icon": "🍺",
            "color": "from-yellow-400 to-amber-600",
            "brands": ["Budweiser", "Corona", "Heineken"],
            "strength": 2,
            "sweetness": 3,
            "complexity": 3,
            "abv": "4-5%",
            "rarity": "common"
        },
        {
            "name": "Beer (IPA)",
            "description": "Hoppy and bold",
            "mood_match": [2, 1, 2, 3, 1],
            "icon": "🍻",
            "color": "from-orange-500 to-amber-700",
            "brands": ["Lagunitas", "Sierra Nevada", "Dogfish Head"],
            "strength": 3,
            "sweetness": 2,
            "complexity": 7,
            "abv": "5-7%",
            "rarity": "rare"
        },
        {
            "name": "White Wine",
            "description": "Light and refreshing",
            "mood_match": [1, 1, 1, 1, 1],
            "icon": "🍾",
            "color": "from-yellow-200 to-lime-400",
            "brands": ["Chardonnay", "Sauvignon Blanc", "Pinot Grigio"],
            "strength": 3,
            "sweetness": 5,
            "complexity": 5,
            "abv": "11-13%",
            "rarity": "common"
        },
        {
            "name": "Red Wine",
            "description": "Rich and smooth",
            "mood_match": [1, 1, 2, 3, 1],
            "icon": "🍷",
            "color": "from-red-600 to-rose-900",
            "brands": ["Cabernet Sauvignon", "Merlot", "Pinot Noir"],
            "strength": 4,
            "sweetness": 4,
            "complexity": 8,
            "abv": "12-15%",
            "rarity": "rare"
        },
        {
            "name": "Hard Seltzer",
            "description": "Fizzy and fruity",
            "mood_match": [2, 2, 1, 1, 1],
            "icon": "💧",
            "color": "from-pink-300 to-purple-500",
            "brands": ["White Claw", "Truly", "High Noon"],
            "strength": 2,
            "sweetness": 6,
            "complexity": 2,
            "abv": "4-5%",
            "rarity": "common"
        },
        {
            "name": "Cider",
            "description": "Sweet apple goodness",
            "mood_match": [2, 2, 1, 1, 2],
            "icon": "🍎",
            "color": "from-red-400 to-orange-600",
            "brands": ["Angry Orchard", "Strongbow", "Ace"],
            "strength": 2,
            "sweetness": 8,
            "complexity": 4,
            "abv": "4-6%",
            "rarity": "common"
        },
    ]
}

@app.get("/")
def read_root():
    """Health check endpoint"""
    return {"status": "Shot API is running! 🎉🍹"}

@app.get("/mood/questions")
def get_mood_questions():
    """Get all mood questions"""
    return {"questions": MOOD_QUESTIONS}

@app.post("/mood/suggest")
def suggest_drinks(mood_data: MoodAnswers):
    """
    Calculate mood and suggest drinks based on answers
    
    How it works:
    1. Takes user's answers (0-3 for each question)
    2. Calculates similarity with each drink's mood profile
    3. Returns top 3 matches for the selected preference
    """
    answers = mood_data.answers
    preference = mood_data.preference
    
    if len(answers) != 5:
        raise HTTPException(400, "Must answer all 5 questions")
    
    if preference not in DRINKS:
        raise HTTPException(400, "Invalid preference")
    
    # Calculate match scores for each drink
    drinks_with_scores = []
    for drink in DRINKS[preference]:
        # Calculate how close the user's mood is to this drink
        # Lower difference = better match
        score = sum(abs(answers[i] - drink["mood_match"][i]) for i in range(5))
        drinks_with_scores.append({
            **drink,
            "match_score": score
        })
    
    # Sort by best match (lowest score)
    drinks_with_scores.sort(key=lambda x: x["match_score"])
    
    # Return top 3
    return {
        "suggestions": drinks_with_scores[:3],
        "mood_summary": get_mood_summary(answers)
    }

def get_mood_summary(answers):
    """Generate a fun mood description"""
    energy = answers[0]
    social = answers[1]
    
    if energy >= 3 and social >= 3:
        return "You're ready to PARTY! 🎉"
    elif energy <= 1 and social <= 1:
        return "Cozy vibes only 😌"
    elif energy >= 2:
        return "Feeling energetic and social! ⚡"
    else:
        return "Chill and relaxed mood 🍹"

# ==================== PARTY WRAPPED ====================

@app.post("/party/create")
def create_party(party_data: PartyCreate):
    """
    Create a new party
    Returns a unique party code
    """
    # Generate unique 6-character party code
    party_code = str(uuid.uuid4())[:6].upper()
    
    # Calculate when party ends
    end_time = datetime.now() + timedelta(hours=party_data.duration_hours)
    
    # Store party data
    parties[party_code] = {
        "code": party_code,
        "host": party_data.host_name,
        "created_at": datetime.now().isoformat(),
        "end_time": end_time.isoformat(),
        "duration_hours": party_data.duration_hours,
        "members": [party_data.host_name],
        "is_active": True,
        "photo_count": 0
    }
    
    # Initialize photo storage for this party
    photos[party_code] = []
    os.makedirs(f"data/photos/{party_code}", exist_ok=True)
    
    return {
        "party_code": party_code,
        "end_time": end_time.isoformat(),
        "message": f"Party created! Share code: {party_code}"
    }

@app.post("/party/{party_code}/join")
def join_party(party_code: str, join_data: PartyJoin):
    """Join an existing party"""
    if party_code not in parties:
        raise HTTPException(404, "Party not found")
    
    party = parties[party_code]
    
    # Check if party has ended
    if datetime.now() > datetime.fromisoformat(party["end_time"]):
        raise HTTPException(400, "Party has already ended")
    
    # Add member if not already in
    if join_data.user_name not in party["members"]:
        party["members"].append(join_data.user_name)
    
    return {
        "message": f"Welcome to the party, {join_data.user_name}!",
        "party": party
    }

@app.get("/party/{party_code}/status")
def get_party_status(party_code: str):
    """Get current party status"""
    if party_code not in parties:
        raise HTTPException(404, "Party not found")
    
    party = parties[party_code]
    now = datetime.now()
    end_time = datetime.fromisoformat(party["end_time"])
    
    has_ended = now > end_time
    
    return {
        "party": party,
        "has_ended": has_ended,
        "time_remaining": str(end_time - now) if not has_ended else "0:00:00"
    }

@app.post("/party/{party_code}/upload")
async def upload_photo(party_code: str, file: UploadFile = File(...), user_name: str = ""):
    """
    Upload a photo to the party
    Photos are stored but NOT accessible until party ends
    """
    if party_code not in parties:
        raise HTTPException(404, "Party not found")
    
    party = parties[party_code]
    
    # Check if party has ended
    if datetime.now() > datetime.fromisoformat(party["end_time"]):
        raise HTTPException(400, "Cannot upload - party has ended")
    
    # Generate unique filename
    file_ext = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = f"data/photos/{party_code}/{unique_filename}"
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Store photo metadata
    photo_data = {
        "filename": unique_filename,
        "uploaded_by": user_name,
        "uploaded_at": datetime.now().isoformat(),
        "path": file_path
    }
    photos[party_code].append(photo_data)
    party["photo_count"] += 1
    
    return {
        "message": "Photo uploaded! 📸",
        "total_photos": party["photo_count"]
    }

@app.get("/party/{party_code}/photos")
def get_party_photos(party_code: str):
    """
    Get all party photos
    ONLY accessible after party ends
    """
    if party_code not in parties:
        raise HTTPException(404, "Party not found")
    
    party = parties[party_code]
    
    # Check if party has ended
    if datetime.now() <= datetime.fromisoformat(party["end_time"]):
        raise HTTPException(403, "Photos are locked until the party ends! 🔒")
    
    # Return photo list with full URLs
    photo_list = []
    for photo in photos[party_code]:
        photo_list.append({
            **photo,
            "url": f"/party/{party_code}/photo/{photo['filename']}"
        })
    
    return {
        "photos": photo_list,
        "total": len(photo_list),
        "party_stats": {
            "duration": party["duration_hours"],
            "members": party["members"],
            "total_photos": party["photo_count"]
        }
    }

@app.get("/party/{party_code}/photo/{filename}")
def get_photo(party_code: str, filename: str):
    """
    Serve individual photo files
    """
    if party_code not in parties:
        raise HTTPException(404, "Party not found")
    
    party = parties[party_code]
    
    # Check if party has ended
    if datetime.now() <= datetime.fromisoformat(party["end_time"]):
        raise HTTPException(403, "Photos are locked until the party ends!")
    
    # Check if photo exists
    file_path = f"data/photos/{party_code}/{filename}"
    if not os.path.exists(file_path):
        raise HTTPException(404, "Photo not found")
    
    return FileResponse(file_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)