from app.db.orm import get_db
import app.schema.schema as schema
from app.api.helper import password_hash
from app.db import models
from app.api.helper import access_token
from app.api.helper import current_user
from fastapi import APIRouter, Depends, HTTPException,status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
import dotenv
import os

dotenv.load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")  

oauth = OAuth2PasswordBearer(tokenUrl="auth/login")
router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup/", response_model=schema.Usersbase)
def add_student(user: schema.UserSignup, db:Session = Depends(get_db)):
    exist = db.query(models.Usersbase).filter(models.Usersbase.email == user.email).first()


    if exist:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, 
                            detail= f"Email already exists with {user.email}")
    
    hased_password = password_hash.hash_pass(user.password)
    user.password = hased_password

    if user.role == "student" and user.age is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Age is required for students")
    user_new= user.model_dump(exclude={"age"})
    new_std = models.Usersbase(**user_new)
    db.add(new_std)
    db.commit()
    db.refresh(new_std)


    if user.role == "student":
        std_data = models.Student(
        id = new_std.id,
        Studentname = user.name,
        RollNo = 1000+ new_std.id,
        age = user.age,
        parent_id = None
        )

        db.add(std_data)
        db.commit()
        db.refresh(std_data)

    return new_std

@router.post("/login", response_model=schema.token_response)
def userLogin(data: schema.UserLogin, db:Session = Depends(get_db)):

    user = db.query(models.Usersbase).filter(models.Usersbase.email == data.email).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with email {data.email} not found")
    
    pass_hash = password_hash.verify_pass(data.password, user.password)

    if not pass_hash:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid password")
    
    token = access_token.create_access_token(data={"email": user.email,
                                                   "id":user.id,
                                                   "role": user.role})

    return {"role": user.role, "email": user.email, "access_token": token, "token_type": "bearer"}  



@router.get("/currentuser",response_model=schema.current_user)
def current_usr(token:str = Depends(oauth)):

    try: 
        current_user_data = current_user.user(token)
        return current_user_data
    except HTTPException as e:
        raise e























# @router.get("/students/{student_id}", response_model=schema.Usersbase)
# def get_student(student_
# id:int, db:Session=Depends(get_db)):
#     student = db.query(models.Student).filter(models.Student.id == student_id).first()
#     if not student:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Student with id {student_id} not found")
#     return student


# @router.get("/students/", response_model=list[schema.Usersbase])
# def get_all_student(db:Session=Depends(get_db)):
#     student = db.query(models.Student).all()
#     if not student:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Student with id {student_id} not found")
#     return student
