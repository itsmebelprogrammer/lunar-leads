import asyncio, sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.db.session import AsyncSessionLocal
from app.models.state import State
from app.models.niche import Niche
from sqlalchemy import select

STATES = [
    ("AC","Acre"),("AL","Alagoas"),("AP","Amapa"),("AM","Amazonas"),
    ("BA","Bahia"),("CE","Ceara"),("DF","Distrito Federal"),("ES","Espirito Santo"),
    ("GO","Goias"),("MA","Maranhao"),("MT","Mato Grosso"),("MS","Mato Grosso do Sul"),
    ("MG","Minas Gerais"),("PA","Para"),("PB","Paraiba"),("PR","Parana"),
    ("PE","Pernambuco"),("PI","Piaui"),("RJ","Rio de Janeiro"),("RN","Rio Grande do Norte"),
    ("RS","Rio Grande do Sul"),("RO","Rondonia"),("RR","Roraima"),("SC","Santa Catarina"),
    ("SP","Sao Paulo"),("SE","Sergipe"),("TO","Tocantins"),
]

NICHES = [
    ("restaurantes", "Restaurantes", "restaurantes"),
    ("clinicas", "Clinicas", "clinicas medicas"),
    ("advocacias", "Escritorios de Advocacia", "escritorio advocacia"),
    ("imobiliarias", "Imobiliarias", "imobiliaria"),
    ("saloes", "Saloes de Beleza", "salao de beleza"),
    ("academias", "Academias", "academia fitness"),
    ("farmacias", "Farmacias", "farmacia"),
    ("pet-shops", "Pet Shops", "pet shop"),
    ("contabilidades", "Escritorios de Contabilidade", "contabilidade"),
    ("auto-escolas", "Auto Escolas", "auto escola"),
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
        print("Seed completo!")

try:
    asyncio.run(seed())
except Exception as e:
    print(f"SEED ERROR: {e}", flush=True)
    import traceback
    traceback.print_exc()
    sys.exit(1)