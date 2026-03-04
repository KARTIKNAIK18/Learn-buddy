from fastapi import APIRouter, Depends, HTTPException,status
from sqlalchemy.orm import Session
from sqlalchemy import func
import app.schema.classroom_schema as schema
from app.db.orm import get_db
from app.api.helper.current_user import user
import app.db.models as models





router = APIRouter(prefix="/teachers", tags=["teachers"])


@router.post("/createclassroom", response_model=schema.ClassroomResponse)
def create_classroom(data: schema.ClassroomCreate, current_user: dict = Depends(user), db: Session = Depends(get_db)):
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Only teachers can create classrooms")
    name = db.query(models.Classroom).filter(models.Classroom.class_name == data.class_name).first()

    if name :
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,detail=f"Class name with {data.class_name} alredy exist!! ")
    new_classroom = models.Classroom(
        teacher_id=current_user["id"],
        class_name=data.class_name,
        academic_year=data.academic_year,
        section=data.section)
    db.add(new_classroom)
    db.commit()
    db.refresh(new_classroom)

    return new_classroom


@router.put("/approve-enrollment/{enrollment_id}/approve")
def approve_enrollment(
    enrollment_id: int,
    current_user: dict = Depends(user),
    db: Session = Depends(get_db)
):

    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403)

    enrollment = (
        db.query(models.ClassroomStudent)
        .join(models.Classroom, models.Classroom.id == models.ClassroomStudent.classroom_id)
        .filter(
            models.ClassroomStudent.id == enrollment_id,
            models.Classroom.teacher_id == current_user["id"],
        )
        .first()
    )

    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found or not in your classrooms")

    enrollment.status = models.EnrollmentStatus.ACTIVE
    db.commit()

    return {"message": "Student approved"}

@router.delete("/approve-enrollment/{enrollment_id}/reject")
def approve_enrollment(
    enrollment_id: int,
    current_user: dict = Depends(user),
    db: Session = Depends(get_db)
):

    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403)

    enrollment = (
        db.query(models.ClassroomStudent)
        .join(models.Classroom, models.Classroom.id == models.ClassroomStudent.classroom_id)
        .filter(
            models.ClassroomStudent.id == enrollment_id,
            models.Classroom.teacher_id == current_user["id"],
        )
        .first()
    )

    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found or not in your classrooms")

    enrollment.status = models.EnrollmentStatus.DROPPED
    db.commit()

    return {"message": "Student not approved"}


@router.get("/classrooms/")
def get_students_in_classroom(
    current_user: dict = Depends(user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403)

    classsroom_std = db.query(models.Classroom).filter(
        models.Classroom.teacher_id == current_user["id"]
    ).all()

    return classsroom_std

@router.get("/enrollments")
def get_pending_enrollments(
    current_user: dict = Depends(user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can view enrollments")

    
    enrollments = (
        db.query(models.ClassroomStudent)
        .join(models.Classroom, models.Classroom.id == models.ClassroomStudent.classroom_id)
        .filter(
            models.Classroom.teacher_id == current_user["id"],
            models.ClassroomStudent.status == models.EnrollmentStatus.PENDING
        )
        .all()
    )
    return enrollments



@router.get("/classrooms/{classroom_id}/students")
def get_classroom_students(
    classroom_id: int,
    current_user: dict = Depends(user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can view classroom students")

    # Verify classroom belongs to this teacher
    classroom = db.query(models.Classroom).filter(
        models.Classroom.id == classroom_id,
        models.Classroom.teacher_id == current_user["id"]
    ).first()

    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")

    rows = (
        db.query(models.ClassroomStudent, models.Student)
        .join(models.Student, models.Student.id == models.ClassroomStudent.student_id)
        .filter(
            models.ClassroomStudent.classroom_id == classroom_id,
            models.ClassroomStudent.status == models.EnrollmentStatus.ACTIVE,
        )
        .all()
    )

    return [
        {
            "enrollment_id": enr.id,
            "student_id":    stu.id,
            "name":          stu.Studentname,
            "roll_no":       stu.RollNo,
            "age":           stu.age,
            "status":        enr.status.value,
        }
        for enr, stu in rows
    ]


@router.get("/all-students")
def get_all_students(
    current_user: dict = Depends(user),
    db: Session = Depends(get_db),
):
    """Return all unique active students across all of this teacher's classrooms."""
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can view students")

    rows = (
        db.query(models.Student)
        .join(models.ClassroomStudent, models.ClassroomStudent.student_id == models.Student.id)
        .join(models.Classroom, models.Classroom.id == models.ClassroomStudent.classroom_id)
        .filter(
            models.Classroom.teacher_id == current_user["id"],
            models.ClassroomStudent.status == models.EnrollmentStatus.ACTIVE,
        )
        .distinct(models.Student.id)
        .all()
    )

    return [
        {"student_id": s.id, "name": s.Studentname, "roll_no": s.RollNo, "age": s.age}
        for s in rows
    ]


@router.get("/students/{student_id}/performance", response_model=schema.PointsTotal)
def get_student_performance(
    student_id: int,
    current_user: dict = Depends(user),
    db: Session = Depends(get_db),
):
    """Return the activity-based points summary for a specific student."""
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can view performance")

    # Verify the student is enrolled (active) in one of this teacher's classrooms
    enrolled = (
        db.query(models.ClassroomStudent)
        .join(models.Classroom, models.Classroom.id == models.ClassroomStudent.classroom_id)
        .filter(
            models.ClassroomStudent.student_id == student_id,
            models.ClassroomStudent.status == models.EnrollmentStatus.ACTIVE,
            models.Classroom.teacher_id == current_user["id"],
        )
        .first()
    )
    if not enrolled:
        raise HTTPException(status_code=403, detail="This student is not in your classrooms")

    row = db.query(
        func.coalesce(func.sum(models.StudentActivityLog.points_earned), 0),
        func.count(models.StudentActivityLog.id),
    ).filter(models.StudentActivityLog.student_id == student_id).first()

    total_points         = int(row[0])
    activities_completed = int(row[1])

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

    def _level(t):
        if t < 100: return "Beginner"
        if t < 250: return "Learner"
        if t < 500: return "Explorer"
        return "Champion"

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
        level=_level(total_points),
        breakdown=breakdown,
    )