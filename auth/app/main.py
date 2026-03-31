import os
from dotenv import load_dotenv
from fastapi import FastAPI
from app.db.orm import engine
import app.db.models as models
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import users,parents,teacher,classroom,student,tts,points
from app.api.routers import vocab, recommendations


try:
    print("Trying to connect to the database...")
    models.Base.metadata.create_all(bind=engine)
    print("Database connection successful ")
except Exception as e:
    print(f"Error connecting to the database: {e}")
    exit(1)

load_dotenv()

app = FastAPI()

origin = os.getenv("ALLOWED_ORIGIN")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(student.router)
app.include_router(classroom.router)
app.include_router(users.router)
app.include_router(parents.router)
app.include_router(teacher.router)
app.include_router(tts.router)
app.include_router(points.router)
app.include_router(vocab.router)
app.include_router(recommendations.router)

@app.get("/")
def main():
    return {"message": "Backend is running!"}

@app.get("/health")
def main():
    return {"message": "Backend is healthy!"}



