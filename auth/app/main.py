from fastapi import FastAPI
from app.db.orm import engine
import app.db.models as models
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import users,parents,teacher,classroom,student,tts,points
from app.api.routers import vocab

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],   # "*" allows any hosted domain
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

@app.get("/")
def main():
    return {"message": "Hello World"}


