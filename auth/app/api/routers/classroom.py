from fastapi import APIRouter, Depends, HTTPException,status
from sqlalchemy.orm import Session
import app.schema.classroom_schema as schema
from app.db.orm import get_db
from app.api.helper.current_user import user
import app.db.models as models
from app.schema import classroom_schema


router = APIRouter(prefix="/classroom", tags=["classroom"])

@router.post("/{classroom_id}/add-content", response_model=classroom_schema.ContentCreateSchema)
def add_content(
    classroom_id: int,
    data: classroom_schema.ContentCreateSchema,
    current_user: dict = Depends(user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403)

    classroom = db.query(models.Classroom).filter(
        models.Classroom.id == classroom_id,
        models.Classroom.teacher_id == current_user["id"],
    ).first()
    if not classroom:
        raise HTTPException(status_code=403, detail="You do not own this classroom")

    content = models.LearningContent(
        classroom_id=classroom_id,
        title=data.title,
        description=data.description,
        content_type=data.content_type,
        content_url=data.content_url,
    )

    db.add(content)
    db.commit()
    db.refresh(content)

    return content

@router.get("/{classroom_id}/content")
def get_classroom_content(
    classroom_id: int,
    current_user: dict = Depends(user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403)

    classroom = db.query(models.Classroom).filter(
        models.Classroom.id == classroom_id,
        models.Classroom.teacher_id == current_user["id"],
    ).first()
    if not classroom:
        raise HTTPException(status_code=403, detail="You do not own this classroom")

    return db.query(models.LearningContent).filter(
        models.LearningContent.classroom_id == classroom_id
    ).all()


@router.delete("/{classroom_id}/content/{content_id}")
def delete_content(
    content_id: int,
    classroom_id: int,
    current_user: dict = Depends(user),
    db: Session = Depends(get_db)
):

    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can delete content")

    content = db.query(models.LearningContent).filter(
        models.LearningContent.id == content_id,
        models.LearningContent.classroom_id == classroom_id
    ).first()

    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    # Verify this classroom belongs to the requesting teacher
    classroom = db.query(models.Classroom).filter(
        models.Classroom.id == classroom_id,
        models.Classroom.teacher_id == current_user["id"],
    ).first()
    if not classroom:
        raise HTTPException(status_code=403, detail="You do not own this classroom")

    db.delete(content)
    db.commit()

    return {"message": "Content deleted successfully"}
