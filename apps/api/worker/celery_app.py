from celery import Celery
from app.core.settings import settings

def _redis_url(url: str) -> str:
    if url.startswith("rediss://") and "ssl_cert_reqs" not in url:
        sep = "&" if "?" in url else "?"
        return f"{url}{sep}ssl_cert_reqs=CERT_NONE"
    return url

_broker = _redis_url(settings.REDIS_URL)

celery = Celery(
    "lunar",
    broker=_broker,
    backend=_broker,
    include=["worker.tasks"],
)
celery.conf.task_serializer = "json"
celery.conf.result_serializer = "json"
celery.conf.timezone = "America/Sao_Paulo"