from sqlalchemy import Column, Integer, String,ForeignKey,text,TIMESTAMP,DateTime,Enum
from sqlalchemy.orm import relationship
from app.db.orm import Base
from datetime import datetime
import enum


# class Role(enum.Enum):
#      student = "student"
#      teacher = "teacher"
#      admin = "admin"
#      parents = "parents"

class Usersbase(Base):
    __tablename__ = "users"
    id = Column(Integer,primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, 
                        server_default=text('now()'))


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, ForeignKey("users.id"), index=True,primary_key=True)
    Studentname = Column(String, nullable=False)
    # email = Column(String, unique=True, index=True, nullable=False)
    # password = Column(String, nullable=False)
    RollNo = Column(Integer, nullable=False)
    age = Column(Integer, nullable=False)
    parent_id = Column(Integer, ForeignKey("users.id"), nullable=True)


class teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, ForeignKey("users.id"), index=True,primary_key=True)
    teachername = Column(String, nullable=False)
    # email = Column(String, unique=True, index=True, nullable=False)
    Speacilization = Column(String, nullable=True)
    expirience = Column(Integer, nullable=False)


class EnrollmentStatus(enum.Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    DROPPED = "DROPPED"
    COMPLETED = "COMPLETED"

class Classroom(Base):
    __tablename__ = "classrooms"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    class_name = Column(String, nullable=False)
    academic_year = Column(String, nullable=False)
    section = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=text('now()'))

    students = relationship("ClassroomStudent", back_populates="classroom")

class ClassroomStudent(Base):
    __tablename__ = "classroom_students"

    id = Column(Integer, primary_key=True, index=True)

    classroom_id = Column(Integer, ForeignKey("classrooms.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    status = Column(Enum(EnrollmentStatus), default=EnrollmentStatus.PENDING)

    enrolled_at = Column(DateTime(timezone=True), server_default=text('now()'))

    classroom = relationship("Classroom", back_populates="students")


class LearningContent(Base):
    __tablename__ = "learning_content"

    id = Column(Integer, primary_key=True, index=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"))
    title = Column(String, nullable=False)
    description = Column(String)
    content_type = Column(String)  # video, pdf, image
    content_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=text('now()'))


class StudentActivityLog(Base):
    __tablename__ = "student_activity_log"

    id            = Column(Integer, primary_key=True, index=True)
    student_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_name = Column(String, nullable=False)
    points_earned = Column(Integer, nullable=False)
    completed_at  = Column(DateTime(timezone=True), server_default=text('now()'))


class VocabWord(Base):
    __tablename__ = "vocab_words"

    id          = Column(Integer, primary_key=True, index=True)
    teacher_id  = Column(Integer, ForeignKey("users.id"), nullable=False)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"), nullable=True)
    category    = Column(String, nullable=False)   # e.g. "Animals", "Custom"
    en          = Column(String, nullable=False)   # English word
    kn          = Column(String, nullable=True)    # Kannada translation
    tul         = Column(String, nullable=True)    # Tulu translation
    image_url   = Column(String, nullable=True)    # Cloudinary image URL
    audio_url   = Column(String, nullable=True)    # Cloudinary audio URL for sound effects
    created_at  = Column(DateTime(timezone=True), server_default=text('now()'))
