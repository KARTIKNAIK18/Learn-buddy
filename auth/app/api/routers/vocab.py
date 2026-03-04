from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.db.orm import get_db
from app.db.models import VocabWord, ClassroomStudent, EnrollmentStatus, Classroom
from app.api.helper.current_user import user
from app.schema.vocab_schmea import VocabWordCreate, VocabWordOut

router = APIRouter(prefix="/vocab", tags=["vocab"])




@router.post("/", response_model=VocabWordOut, status_code=201)
def add_vocab_word(
    body: VocabWordCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(user),
):
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Teachers only")

    # If classroom_id given, verify teacher owns it
    if body.classroom_id:
        cls = db.query(Classroom).filter(
            Classroom.id == body.classroom_id,
            Classroom.teacher_id == current_user["id"],
        ).first()
        if not cls:
            raise HTTPException(status_code=403, detail="Not your classroom")

    word = VocabWord(
        teacher_id  = current_user["id"],
        classroom_id = body.classroom_id,
        category    = body.category.strip(),
        en          = body.en.strip(),
        kn          = (body.kn or "").strip(),
        tul         = (body.tul or "").strip(),
    )
    db.add(word)
    db.commit()
    db.refresh(word)
    return word


@router.get("/my", response_model=List[VocabWordOut])
def get_my_vocab_words(
    db: Session = Depends(get_db),
    current_user: dict = Depends(user),
):
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Teachers only")

    words = db.query(VocabWord).filter(
        VocabWord.teacher_id == current_user["id"]
    ).order_by(VocabWord.category, VocabWord.id).all()
    return words


@router.delete("/{word_id}", status_code=204)
def delete_vocab_word(
    word_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(user),
):
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Teachers only")

    word = db.query(VocabWord).filter(
        VocabWord.id == word_id,
        VocabWord.teacher_id == current_user["id"],
    ).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")

    db.delete(word)
    db.commit()

    

@router.get("/student", response_model=List[VocabWordOut])
def get_vocab_for_student(
    db: Session = Depends(get_db),
    current_user: dict = Depends(user),
):
    """
    Returns all custom vocab words added by the teachers of classrooms
    the current student is ACTIVELY enrolled in.
    """
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Students only")

    # Get all classroom IDs this student is actively enrolled in
    enrolled = db.query(ClassroomStudent).filter(
        ClassroomStudent.student_id == current_user["id"],
        ClassroomStudent.status == EnrollmentStatus.ACTIVE,
    ).all()

    if not enrolled:
        return []

    classroom_ids = [e.classroom_id for e in enrolled]

    # Get teacher IDs for those classrooms
    classrooms = db.query(Classroom).filter(Classroom.id.in_(classroom_ids)).all()
    teacher_ids = list({c.teacher_id for c in classrooms})

    # Get all vocab words by those teachers
    words = db.query(VocabWord).filter(
        VocabWord.teacher_id.in_(teacher_ids)
    ).order_by(VocabWord.category, VocabWord.id).all()

    return words
