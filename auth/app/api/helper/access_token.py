from jose import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
from datetime import timedelta

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
EXPIRE_TIME = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")

def create_access_token(data: dict):
   data_to_encode = data.copy()
   expire = datetime.utcnow() + timedelta(seconds=int(EXPIRE_TIME))
   data_to_update =data_to_encode.update( {"exp": expire})
   Token =  jwt.encode(data_to_encode, SECRET_KEY, algorithm=ALGORITHM)

   return Token
    