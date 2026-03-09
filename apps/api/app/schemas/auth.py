from pydantic import BaseModel, EmailStr

class RegisterIn(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class LoginOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: str
    full_name: str | None
    email: str
    role: str
    model_config = {"from_attributes": True}