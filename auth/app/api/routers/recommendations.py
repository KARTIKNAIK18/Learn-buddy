from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.orm import get_db
from app.api.helper.current_user import user
from app.recommendations.engine import RecommendationEngine

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("")
def get_recommendations(
    current_user: dict = Depends(user),
    db: Session = Depends(get_db)
):
    """Get personalized activity recommendations for current student"""
    if current_user["role"] != "student":
        return {"success": False, "error": "Only students can get recommendations"}
    
    engine = RecommendationEngine(db, current_user["id"])
    recommendations = engine.get_recommendations(count=3)
    
    return {
        "success": True,
        "recommendations": recommendations
    }
