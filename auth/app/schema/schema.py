from pydantic import BaseModel, ConfigDict,EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

class Role(str, Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"
    parents = "parents"


class Student_Login(BaseModel):
    Studentname: str
    email: EmailStr
    password: str
    RollNo: int
    age: int

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Role


class Teacher_Login(BaseModel):
    username: str
    email: EmailStr
    department: Optional[str] = None
    teacher_id: int

class get_student(BaseModel):
    id: int
    Studentname: str
    email: EmailStr
    RollNo: int
    age: int

class Usersbase(BaseModel):
  id: int
  name: str
  email: EmailStr
  password: str
  role: Role
  created_at : datetime
  model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel): 
    email: EmailStr
    password: str

class token_response(BaseModel):
    role: Role
    email: EmailStr
    access_token: str
    token_type: str
    model_config = ConfigDict(from_attributes=True)

class current_user(BaseModel):
    email: EmailStr
    id: int
    role: Role

class UseraddStudent(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[Role] = Role.student
    age:int

class student_out(BaseModel):
    Studentname: str
    RollNo: int
    age: int
    parent_id: int

class Student_Repsonse(BaseModel):
    id: int
    Studentname: str
    age: int
    rollno: int
    
    model_config = ConfigDict(from_attributes=True)

class Config:
    orm_mode = True






