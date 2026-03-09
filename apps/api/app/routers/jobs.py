from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.db.session import get_db
from app.models.job import Job
from app.models.job_event import JobEvent
from app.models.lead import Lead
from app.models.niche import Niche
from app.models.user import User
from app.schemas.job import JobCreate, JobOut, JobEventOut, LeadOut, QuotaOut
from app.core.deps import get_current_user
from app.services.quota import get_quota, check_quota, MONTHLY_LIMIT
import uuid, csv, io
from datetime import datetime, timezone

router = APIRouter(prefix="/jobs", tags=["jobs"])

ADMIN_LEADS_LIMIT = 200

def is_admin(user: User) -> bool:
    return str(user.role) == "ADMIN"

def job_to_out(job: Job) -> JobOut:
    return JobOut(
        id=str(job.id),
        status=job.status,
        job_month=job.job_month,
        state_id=job.state_id,
        niche_id=job.niche_id,
        export_format=job.export_format,
        leads_found=job.leads_found,
        leads_limit=job.leads_limit,
        created_at=job.created_at,
        finished_at=job.finished_at,
        error_message=job.error_message,
    )

@router.get("/quota", response_model=QuotaOut)
async def quota(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if is_admin(current_user):
        return QuotaOut(month=datetime.now(timezone.utc).strftime("%Y-%m"), leads_used=0, leads_limit=999)
    q = await get_quota(str(current_user.id), db)
    return QuotaOut(month=q.month, leads_used=q.leads_used, leads_limit=MONTHLY_LIMIT)

@router.post("", response_model=JobOut, status_code=201)
async def create_job(body: JobCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not is_admin(current_user):
        if not await check_quota(str(current_user.id), db):
            raise HTTPException(402, "Cota mensal esgotada")
    result = await db.execute(select(Job).where(Job.user_id == current_user.id, Job.status.in_(["QUEUED","RUNNING"])))
    if result.scalar_one_or_none():
        raise HTTPException(409, "Voce ja tem uma geracao de leads ativa")

    limit = ADMIN_LEADS_LIMIT if is_admin(current_user) else MONTHLY_LIMIT

    job = Job(
        user_id=current_user.id,
        state_id=body.state_id,
        niche_id=body.niche_id,
        job_month=body.job_month,
        export_format=body.export_format,
        selected_columns=body.selected_columns,
        leads_limit=limit,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    try:
        from worker.tasks import run_scraper
        run_scraper.delay(str(job.id))
    except Exception:
        pass
    return job_to_out(job)

@router.get("", response_model=List[JobOut])
async def list_jobs(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.user_id == current_user.id).order_by(Job.created_at.desc()))
    return [job_to_out(j) for j in result.scalars().all()]

@router.get("/{job_id}", response_model=JobOut)
async def get_job(job_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == uuid.UUID(job_id), Job.user_id == current_user.id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(404, "Leads nao encontrados")
    return job_to_out(job)

@router.get("/{job_id}/events", response_model=List[JobEventOut])
async def get_events(job_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(JobEvent).where(JobEvent.job_id == uuid.UUID(job_id)).order_by(JobEvent.ts))
    return [JobEventOut(id=str(e.id), ts=e.ts, level=e.level, message=e.message) for e in result.scalars().all()]

@router.get("/{job_id}/leads", response_model=List[LeadOut])
async def get_leads(job_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lead).where(Lead.job_id == uuid.UUID(job_id)))
    leads = result.scalars().all()
    return [LeadOut(id=str(l.id), name=l.name, phone_raw=l.phone_raw, phone_e164=l.phone_e164, website_url=l.website_url, whatsapp_url=l.whatsapp_url) for l in leads]

@router.get("/{job_id}/download")
async def download(job_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == uuid.UUID(job_id), Job.user_id == current_user.id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(404, "Leads nao encontrados")

    niche_result = await db.execute(select(Niche).where(Niche.id == job.niche_id))
    niche = niche_result.scalar_one_or_none()
    niche_label = niche.label.replace(" ", "_") if niche else "Leads"

    finished = job.finished_at or datetime.now(timezone.utc)
    date_str = finished.strftime("%d-%m-%Y_%Hh%M")
    filename = f"{niche_label}_{date_str}.csv"

    result2 = await db.execute(select(Lead).where(Lead.job_id == uuid.UUID(job_id)))
    leads = result2.scalars().all()
    if not leads:
        raise HTTPException(404, "Sem leads para download")

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["nome", "telefone", "telefone_e164", "website", "whatsapp"])
    for l in leads:
        writer.writerow([l.name, l.phone_raw, l.phone_e164, l.website_url, l.whatsapp_url])
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )