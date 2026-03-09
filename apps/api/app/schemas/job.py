from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, List

class JobCreate(BaseModel):
    state_id: int
    niche_id: int
    job_month: str
    export_format: str = "CSV"
    selected_columns: List[str] = ["name", "phone", "website"]

    @field_validator("export_format")
    @classmethod
    def normalize_format(cls, v):
        return v.upper()

class JobOut(BaseModel):
    id: str
    status: str
    job_month: Optional[str] = None
    state_id: int
    niche_id: int
    export_format: str
    leads_found: int
    leads_limit: int
    created_at: datetime
    finished_at: Optional[datetime] = None
    error_message: Optional[str] = None
    model_config = {"from_attributes": True}

class JobEventOut(BaseModel):
    id: str
    ts: datetime
    level: str
    message: str
    model_config = {"from_attributes": True}

class LeadOut(BaseModel):
    id: str
    name: str
    phone_raw: Optional[str] = None
    phone_e164: Optional[str] = None
    website_url: Optional[str] = None
    whatsapp_url: Optional[str] = None
    model_config = {"from_attributes": True}

class QuotaOut(BaseModel):
    month: str
    leads_used: int
    leads_limit: int