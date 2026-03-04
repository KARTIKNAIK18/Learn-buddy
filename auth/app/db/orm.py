from dotenv import load_dotenv
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import psycopg2


load_dotenv()
DATABASE_URL = os.getenv("SQLALCHEMY_DATABASE_URL")

if (DATABASE_URL is None):
    raise Exception("DATABASE_URL environment variable not set")
else:
    print(f"{DATABASE_URL} is set")
    engine = create_engine(DATABASE_URL)

    Sessionlocal = sessionmaker(autoflush=False, autocommit = False, bind=engine)

    Base = declarative_base()



def get_db():
    db = Sessionlocal()
    try:
        yield db
    finally:
        db.close()
