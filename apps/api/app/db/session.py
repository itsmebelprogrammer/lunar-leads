import ssl
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.core.settings import settings

def _connect_args(url: str) -> dict:
    if "localhost" in url or "127.0.0.1" in url:
        return {}
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return {"ssl": ctx}

engine = create_async_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    connect_args=_connect_args(settings.DATABASE_URL),
)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session