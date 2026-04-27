"""
Rename this file to seed.py and fill in STATES and NICHES before running.

  python scripts/seed.py
"""

import asyncio, sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.db.session import AsyncSessionLocal
from app.models.state import State
from app.models.niche import Niche
from sqlalchemy import select

# Format: ("UF", "Full state name")
STATES: list[tuple[str, str]] = [
    # ("SP", "Sao Paulo"),
    # ("RJ", "Rio de Janeiro"),
]

# Format: ("slug", "Display label", "Google Maps search query")
NICHES: list[tuple[str, str, str]] = [
    # ("restaurantes", "Restaurantes", "restaurantes"),
    # ("clinicas", "Clinicas", "clinicas medicas"),
]

async def seed():
    async with AsyncSessionLocal() as db:
        for uf, name in STATES:
            exists = await db.execute(select(State).where(State.uf == uf))
            if not exists.scalar_one_or_none():
                db.add(State(uf=uf, name=name))
        for slug, label, query in NICHES:
            exists = await db.execute(select(Niche).where(Niche.slug == slug))
            if not exists.scalar_one_or_none():
                db.add(Niche(slug=slug, label=label, default_query=query))
        await db.commit()
        print("Seed complete!")

try:
    asyncio.run(seed())
except Exception as e:
    print(f"SEED ERROR: {e}", flush=True)
    import traceback
    traceback.print_exc()
    sys.exit(1)
