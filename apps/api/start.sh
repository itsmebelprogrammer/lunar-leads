#!/bin/sh
set -e

celery -A worker.celery_app.celery worker --loglevel=info --pool=solo &

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
