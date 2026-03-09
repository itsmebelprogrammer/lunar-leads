import asyncio
import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from worker.celery_app import celery
from app.models.job import Job
from app.models.job_event import JobEvent
from app.models.lead import Lead
from app.models.niche import Niche
from app.models.state import State
from app.services.quota import consume_quota
from app.core.settings import settings

def make_session():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    Session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    return Session()

async def add_event(db, job_uuid: uuid.UUID, message: str, level: str = "INFO"):
    db.add(JobEvent(
        id=uuid.uuid4(),
        job_id=job_uuid,
        message=message,
        level=level,
    ))
    await db.commit()

@celery.task(bind=True, name="worker.tasks.run_scraper", time_limit=300, soft_time_limit=270)
def run_scraper(self, job_id: str):
    async def _run():
        job_uuid = uuid.UUID(job_id)
        async with make_session() as db:
            result = await db.execute(select(Job).where(Job.id == job_uuid))
            job = result.scalar_one_or_none()
            if not job:
                return

            niche = (await db.execute(select(Niche).where(Niche.id == job.niche_id))).scalar_one_or_none()
            state = (await db.execute(select(State).where(State.id == job.state_id))).scalar_one_or_none()
            niche_label = niche.label if niche else ""
            state_name  = state.name  if state else ""

            job.status     = "RUNNING"
            job.started_at = datetime.now(timezone.utc)
            await db.commit()
            await add_event(db, job_uuid, f"Iniciando: {niche_label} em {state_name}")

            try:
                from worker.scraper import scrape_google_maps
                leads_data = scrape_google_maps(niche_label, state_name, job.leads_limit)

                for ld in leads_data:
                    db.add(Lead(
                        id=uuid.uuid4(),
                        job_id=job_uuid,
                        name=ld.get("name", ""),
                        phone_raw=ld.get("phone"),
                        phone_e164=ld.get("phone_e164"),
                        website_url=ld.get("website"),
                        whatsapp_url=ld.get("whatsapp"),
                    ))
                    job.leads_found += 1
                    await db.commit()
                    await add_event(db, job_uuid, f"Lead coletado: {ld.get('name', '')}")

                await consume_quota(job.user_id, job.leads_found, db)
                job.status      = "DONE"
                job.finished_at = datetime.now(timezone.utc)
                await db.commit()
                await add_event(db, job_uuid, f"Concluido: {job.leads_found} leads")

            except Exception as e:
                job.status        = "FAILED"
                job.error_message = str(e)[:500]
                job.finished_at   = datetime.now(timezone.utc)
                await db.commit()
                await add_event(db, job_uuid, f"Erro: {str(e)[:200]}", "ERROR")

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(_run())
    finally:
        loop.close()