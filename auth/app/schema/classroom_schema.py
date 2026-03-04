from pydantic import BaseModel,ConfigDict
from datetime import datetime
 

class ClassroomCreate(BaseModel):
    class_name: str
    academic_year: str
    section: str

class ClassroomResponse(BaseModel):
    teacher_id: int
    class_name: str
    academic_year: str
    section: str
    created_at: datetime

    class Config:
        orm_mode = True

class   EnrollmentRequest(BaseModel):
        classroom_id: int
        student_id: int

class ContentCreateSchema(BaseModel):
    classroom_id : int
    title : str
    description : str
    content_type : str 
    content_url : str
    
    model_config = ConfigDict(from_attributes=True)


class ClassroomWithTeacher(BaseModel):
    id: int
    class_name: str
    academic_year: str
    section: str
    teacher_name: str | None = None
    teacher_email: str | None = None
    model_config = ConfigDict(from_attributes=True)


class ActivityLogCreate(BaseModel):
    activity_name: str
    points: int


class ActivityBreakdown(BaseModel):
    activity_name: str
    times_completed: int
    points_earned: int


class PointsTotal(BaseModel):
    total_points: int
    activities_completed: int
    level: str
    breakdown: list[ActivityBreakdown]
    model_config = ConfigDict(from_attributes=True)