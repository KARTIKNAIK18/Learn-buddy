from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import app.schema.classroom_schema as schema
from app.db.orm import get_db
from app.api.helper.current_user import user
import app.db.models as models


router = APIRouter(prefix="/student", tags=["students"])


@router.get("/classroom")
def get_my_classrooms(current_user: dict = Depends(user), db: Session = Depends(get_db)):
    """Return ALL active classrooms the student is enrolled in, each with teacher info."""
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can view their classrooms")

    enrollments = (
        db.query(models.ClassroomStudent)
        .filter(
            models.ClassroomStudent.student_id == current_user["id"],
            models.ClassroomStudent.status == models.EnrollmentStatus.ACTIVE,
        )
        .all()
    )

    result = []
    for enrollment in enrollments:
        classroom = db.query(models.Classroom).filter(models.Classroom.id == enrollment.classroom_id).first()
        if not classroom:
            continue
        teacher_user = db.query(models.Usersbase).filter(models.Usersbase.id == classroom.teacher_id).first()
        teacher_row  = db.query(models.teacher).filter(models.teacher.id  == classroom.teacher_id).first()
        result.append({
            "id":            classroom.id,
            "class_name":    classroom.class_name,
            "academic_year": classroom.academic_year,
            "section":       classroom.section,
            "teacher_name":  teacher_row.teachername if teacher_row else (teacher_user.name if teacher_user else None),
            "teacher_email": teacher_user.email if teacher_user else None,
        })

    return result


@router.get("/content/{classroom_id}")
def get_classroom_content(
    classroom_id: int,
    current_user: dict = Depends(user),
    db: Session = Depends(get_db),
):
    """Return all learning content for the given classroom (student must be enrolled)."""
    if current_user["role"] != "student":
        raise HTTPException(status_code=403)

    # Verify student is enrolled
    enrollment = db.query(models.ClassroomStudent).filter(
        models.ClassroomStudent.student_id == current_user["id"],
        models.ClassroomStudent.classroom_id == classroom_id,
        models.ClassroomStudent.status == models.EnrollmentStatus.ACTIVE,
    ).first()
    if not enrollment:
        raise HTTPException(status_code=403, detail="You are not enrolled in this classroom")

    return db.query(models.LearningContent).filter(
        models.LearningContent.classroom_id == classroom_id
    ).all()


# /performance removed — use GET /student/points/total instead


@router.get("/me")
def get_my_profile(current_user: dict = Depends(user), db: Session = Depends(get_db)):
    """Return the logged-in student's profile including their numeric ID and roll number."""
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can view their profile")

    student = db.query(models.Student).filter(
        models.Student.id == current_user["id"]
    ).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    user_row = db.query(models.Usersbase).filter(
        models.Usersbase.id == current_user["id"]
    ).first()

    return {
        "id":      student.id,
        "name":    student.Studentname,
        "email":   user_row.email if user_row else None,
        "roll_no": student.RollNo,
        "age":     student.age,
    }