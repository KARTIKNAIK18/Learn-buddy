
from pydantic import BaseModel
from typing import Optional


class VocabWordCreate(BaseModel):
    classroom_id: Optional[int] = None
    category: str
    en: str
    kn: Optional[str] = ""
    tul: Optional[str] = ""


class VocabWordOut(BaseModel):
    id: int
    teacher_id: int
    classroom_id: Optional[int]
    category: str
    en: str
    kn: Optional[str]
    tul: Optional[str]

    class Config:
        from_attributes = True

