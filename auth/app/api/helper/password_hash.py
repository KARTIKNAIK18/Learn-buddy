from pwdlib import PasswordHash
from dotenv import load_dotenv
import os
load_dotenv()


password_hash = PasswordHash.recommended()


def hash_pass(password: str):
    return password_hash.hash(password)

def verify_pass(plain_pass: str, hashed_pass: str):
    return  password_hash.verify(plain_pass, hashed_pass)

