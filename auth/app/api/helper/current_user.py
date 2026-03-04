from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status,APIRouter
from fastapi.security import OAuth2PasswordBearer
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
EXPIRE_TIME = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")

oauth = OAuth2PasswordBearer(tokenUrl="auth/login")
router = APIRouter(prefix="/students", tags=["students"])


def user(token:str = Depends(oauth)):

    try:
        data = jwt.decode(token=token, key=SECRET_KEY, algorithms=[ALGORITHM])

        # print(data)
        email = data.get("email")
        id = data.get("id")
        role = data.get("role")


        if email is None or id is None or role is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token{email} {id} {role}")

    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token")
    return {"email": email, "id": id, "role": role}