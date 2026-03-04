from fastapi import APIRouter, Depends, HTTPException,status
import app.schema.schema as schema
import app.schema.classroom_schema as classroom_schema
from app.db.orm import get_db
from app.api.helper.current_user import user
import app.db.models as models
from app.api.helper.password_hash import hash_pass
from sqlalchemy.orm import Session





router = APIRouter(prefix="/parents", tags=["parents"])



@router.post("/addstudent", response_model=schema.Student_Repsonse)
def add_student(data:schema.UseraddStudent, current_user = Depends(user), 
                db: Session = Depends(get_db)):
    if current_user["role"] != "parents":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Only parents can add students")
    
    exist = db.query(models.Usersbase).filter(models.Usersbase.email == data.email).first()
    if exist:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"User with email {data.email} already exists")

    new_usr = models.Usersbase(name=data.name,
                             email=data.email,
                             password=hash_pass(data.password),
                             role=data.role)
    
    db.add(new_usr)
    db.commit()
    db.refresh(new_usr)
     
    
    new_std = models.Student(id=new_usr.id,
                             Studentname=data.name,
                             RollNo=1000+new_usr.id,
                             age = data.age, 
                             parent_id=current_user["id"])
    
    db.add(new_std)
    db.commit()
    db.refresh(new_std)

    return {
        "id": new_std.id,
        "Studentname": new_std.Studentname,
        "age": new_std.age,
        "rollno": new_std.RollNo
    }


@router.get("/mystudents", )
def get_my_students(current_user :dict = Depends(user), db: Session = Depends(get_db)):
    if current_user["role"] != "parents":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Only parents can view their students")
    
    students = db.query(models.Student).filter(models.Student.parent_id == current_user["id"]).all()

    return students

     
    
@router.post("/enroll-student")
def enroll_student(
    data: classroom_schema.EnrollmentRequest,
    current_user: dict = Depends(user),
    db: Session = Depends(get_db)
):

    if current_user["role"] != "parents":
        raise HTTPException(status_code=403, detail="Only parents allowed add thier student to the classoom")

    # Ensure student belongs to parent
    student = db.query(models.Student).filter(
        models.Student.id == data.student_id,
        models.Student.parent_id == current_user["id"]
    ).first()

    if not student:
        raise HTTPException(status_code=403, detail="Invalid student")

    enrollment = models.ClassroomStudent(
        classroom_id=data.classroom_id,
        student_id=data.student_id,
        status=models.EnrollmentStatus.PENDING
    )

    db.add(enrollment)
    db.commit()

    return {"message": "Enrollment request sent"}



@router.get("/classrooms")
def get_available_classrooms(
    current_user: dict = Depends(user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "parents":
        raise HTTPException(status_code=403, detail="Only parents can view classrooms")

    classrooms = db.query(models.Classroom).all()
    return classrooms


@router.get("/students/{student_id}/enrollments")
def get_student_enrollments(
    student_id: int,
    current_user: dict = Depends(user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "parents":
        raise HTTPException(status_code=403, detail="Only parents allowed")

    # Verify this student belongs to the logged-in parent
    student = db.query(models.Student).filter(
        models.Student.id == student_id,
        models.Student.parent_id == current_user["id"]
    ).first()
    if not student:
        raise HTTPException(status_code=403, detail="Unauthorized")

    enrollments = db.query(models.ClassroomStudent).filter(
        models.ClassroomStudent.student_id == student_id
    ).all()

    result = []
    for e in enrollments:
        classroom = db.query(models.Classroom).filter(models.Classroom.id == e.classroom_id).first()
        teacher_obj = None
        if classroom:
            teacher_obj = db.query(models.teacher).filter(models.teacher.id == classroom.teacher_id).first()
        result.append({
            "enrollment_id": e.id,
            "status": e.status.value,
            "classroom_id": e.classroom_id,
            "class_name": classroom.class_name if classroom else "Unknown",
            "academic_year": classroom.academic_year if classroom else "",
            "section": classroom.section if classroom else "",
            "teacher_name": teacher_obj.teachername if teacher_obj else "Unknown",
            "enrolled_at": str(e.enrolled_at) if e.enrolled_at else None,
        })
    return result


@router.get("/students/{student_id}/performance")
def get_student_performance(
    student_id: int,
    current_user: dict = Depends(user),
    db: Session = Depends(get_db)
):
    """Return activity-based learning progress for a parent's student."""
    from sqlalchemy import func
    if current_user["role"] != "parents":
        raise HTTPException(status_code=403, detail="Only parents allowed")

    student = db.query(models.Student).filter(
        models.Student.id == student_id,
        models.Student.parent_id == current_user["id"]
    ).first()
    if not student:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Aggregate points
    row = db.query(
        func.coalesce(func.sum(models.StudentActivityLog.points_earned), 0),
        func.count(models.StudentActivityLog.id),
    ).filter(models.StudentActivityLog.student_id == student_id).first()

    total_points         = int(row[0])
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

    def _level(t):
        if t < 100:  return "Beginner"
        if t < 250:  return "Learner"
        if t < 500:  return "Explorer"
        return "Champion"

    return {
        "total_points":          total_points,
        "activities_completed":  activities_completed,
        "level":                 _level(total_points),
        "breakdown": [
            {"activity_name": r.activity_name, "times_completed": r.times, "points_earned": int(r.pts)}
            for r in breakdown_rows
        ],
    }
