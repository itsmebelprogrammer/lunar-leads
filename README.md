# 🌙 Lunar Leads

**B2B SaaS lead generation platform.**

> **This repository contains a public skeleton of the project.** The proprietary scraper and seed data are not included — see the [Scraper](#scraper) and [Seed Data](#seed-data) sections below.

---

## Live Demo

**[▶ Access the app](https://lunar-leads.vercel.app)**

---

## What is it?

Lunar Leads lets small businesses and sales professionals generate qualified lead lists in minutes. The user selects a state and a market niche, the system automatically searches for companies and delivers a CSV file with business name, phone, website, and a direct WhatsApp link.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| API | FastAPI + Python |
| Database | PostgreSQL |
| ORM | SQLAlchemy 2.0 async |
| Migrations | Alembic |
| Auth | JWT |
| Worker | Celery + Redis |
| Frontend | Angular 17+ |
| Infra | Docker Compose |

---

## Features

- User registration and login with JWT authentication
- Monthly quota control per user
- Lead list creation by state + market niche
- Async processing via Celery workers
- CSV download with generated leads
- Admin panel with unlimited quota

---

## Project Structure

```
lunar-leads/
├── apps/
│   └── api/          ← FastAPI backend
│       ├── app/      ← Models, routers, schemas, services
│       ├── worker/   ← Celery + scraper (stub)
│       └── alembic/  ← Database migrations
├── web/              ← Angular 17+ frontend
└── infra/            ← Docker Compose
```

---

## Running Locally

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker

### Backend

```bash
cd apps/api

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Copy and fill environment variables
cp .env.example .env

# Start database and Redis
docker-compose -f ../../infra/docker-compose.yml up -d

# Apply migrations
alembic upgrade head

# Seed states and niches
cp scripts/seed.example.py scripts/seed.py
# Edit seed.py and fill in STATES and NICHES, then run:
python scripts/seed.py

# Start API
uvicorn app.main:app --reload --port 8000
```

### Worker

```bash
cd apps/api
celery -A worker.celery_app.celery worker --loglevel=info --pool=solo
```

### Frontend

```bash
cd web
npm install
ng serve
```

Access at `http://localhost:4200`

---

## Scraper

The `worker/scraper.py` file is not included in this repository — it contains the proprietary implementation.

To activate the scraper, create `worker/scraper.py` and implement the `scrape_google_maps()` function:

```python
def scrape_google_maps(
    niche_label: str,
    state_name: str,
    limit: int = 50
) -> list[dict]:
    # Returns a list of dicts with keys:
    # name, phone, website, whatsapp
    ...
```

---

## Seed Data

The `scripts/seed.py` file is not included in this repository — it contains the proprietary list of states and market niches.

To seed your own instance, copy the example file and fill in your data:

```bash
cp scripts/seed.example.py scripts/seed.py
# Edit seed.py with your STATES and NICHES, then:
python scripts/seed.py
```

---

## License

This project is made available for study and portfolio purposes. The scraper implementation and seed data are not included in this public repository.
