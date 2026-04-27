import os, sys
sys.path.insert(0, os.getcwd())
from logging.config import fileConfig
from sqlalchemy import create_engine, pool
from alembic import context
import app.models

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

from app.models.base import Base
target_metadata = Base.metadata

DB_URL = os.environ.get("DATABASE_URL", "postgresql+psycopg2://lunar:lunar@localhost:5432/lunarleads")
# Garante que usa psycopg2 (sincrono) para migrations
DB_URL = DB_URL.replace("postgresql+asyncpg://", "postgresql+psycopg2://").replace("postgresql://", "postgresql+psycopg2://")
# SSL obrigatorio para ligacoes remotas (psycopg2 sslmode=require nao verifica cert)
if "localhost" not in DB_URL and "127.0.0.1" not in DB_URL and "sslmode" not in DB_URL:
    DB_URL += "?sslmode=require"

def run_migrations_offline():
    context.configure(url=DB_URL, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    engine = create_engine(DB_URL, poolclass=pool.NullPool)
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()