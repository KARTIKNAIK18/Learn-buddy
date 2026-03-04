from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

import app.db.models as models
import app.schema.classroom_schema as schema
from app.db.orm import get_db
from app.api.helper.current_user import user     

router = APIRouter(prefix="/student/points", tags=["points"])


def _compute_level(total: int) -> str:
    if total < 100:
        return "Beginner"
    if total < 250:
        return "Learner"
    if total < 500:
        return "Explorer"
    return "Champion"


@router.post("/add", status_code=201)
def add_points(
    data: schema.ActivityLogCreate,
    current_user: dict = Depends(user),
    db: Session = Depends(get_db),
):
    """Record that the current student completed an activity and earned points."""
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can earn points")

    log = models.StudentActivityLog(
        student_id=current_user["id"],
        activity_name=data.activity_name,
        points_earned=data.points,
    )
    db.add(log)
    db.commit()
    return {"message": "Points added", "points": data.points}


@router.get("/total", response_model=schema.PointsTotal)
def get_total_points(
    current_user: dict = Depends(user),
    db: Session = Depends(get_db),
):
    """Return aggregated point totals, level, and per-activity breakdown for the student."""
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can view their points")

    student_id = current_user["id"]

    # Total points and count
    row = db.query(
        func.coalesce(func.sum(models.StudentActivityLog.points_earned), 0),
        func.count(models.StudentActivityLog.id),
    ).filter(models.StudentActivityLog.student_id == student_id).first()

    total_points       = int(row[0])
    activities_completed = int(row[1])

    # Per-activity breakdown
    breakdown_rows = (
        db.query(
            models.StudentActivityLog.activity_name,
            func.count(models.StudentActivityLog.id).label("times"),
            func.sum(models.StudentActivityLog.points_earned).label("pts"),
        )
        .filter(models.StudentActivityLog.student_id == student_id)
        .group_by(models.StudentActivityLog.activity_name)
        .all()
    )

    breakdown = [
        schema.ActivityBreakdown(
            activity_name=r.activity_name,
            times_completed=r.times,
            points_earned=r.pts,
        )
        for r in breakdown_rows
    ]

    return schema.PointsTotal(
        total_points=total_points,
        activities_completed=activities_completed,
        level=_compute_level(total_points),
        breakdown=breakdown,
    )
