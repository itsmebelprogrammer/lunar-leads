from celery import Celery
from app.core.settings import settings

celery = Celery(
    "lunar",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["worker.tasks"],
)
celery.conf.task_serializer = "json"
celery.conf.result_serializer = "json"
celery.conf.timezone = "America/Sao_Paulo"