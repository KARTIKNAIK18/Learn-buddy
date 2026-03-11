
from pydantic import BaseModel, field_validator
from typing import Optional


class VocabWordCreate(BaseModel):
    classroom_id: Optional[int] = None
    category: str
    en: str
    kn: Optional[str] = None
    tul: Optional[str] = None
    image_url: Optional[str] = None
    audio_url: Optional[str] = None
    
    @field_validator('kn', 'tul', 'image_url', 'audio_url', mode='before')
    @classmethod
    def empty_str_to_none(cls, v):
        """Convert empty strings to None"""
        if v == '' or v == 'null':
            return None
        return v


class VocabWordOut(BaseModel):
    id: int
    teacher_id: int
    classroom_id: Optional[int]
    category: str
    en: str
    kn: Optional[str]
    tul: Optional[str]
    image_url: Optional[str]
    audio_url: Optional[str]

    class Config:
        from_attributes = True



