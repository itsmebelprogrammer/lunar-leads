#!/bin/sh

echo "==> Running database migrations..."
alembic upgrade head || echo "==> Migration failed, skipping (tables will be created by lifespan)"

echo "==> Starting Celery worker..."
celery -A worker.celery_app.celery worker --loglevel=info --pool=solo &

echo "==> Starting API..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
