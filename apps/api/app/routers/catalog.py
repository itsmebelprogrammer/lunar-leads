from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.state import State
from app.models.niche import Niche
from app.schemas.catalog import StateOut, NicheOut
from typing import List

router = APIRouter(prefix="/catalog", tags=["catalog"])

@router.get("/states", response_model=List[StateOut])
async def list_states(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(State).order_by(State.name))
    return result.scalars().all()

@router.get("/niches", response_model=List[NicheOut])
async def list_niches(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Niche).where(Niche.active == True).order_by(Niche.label))
    return result.scalars().all()