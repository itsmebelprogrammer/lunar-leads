from pydantic import BaseModel

class StateOut(BaseModel):
    id: int
    name: str
    uf: str
    model_config = {"from_attributes": True}

class NicheOut(BaseModel):
    id: int
    slug: str
    label: str
    model_config = {"from_attributes": True}