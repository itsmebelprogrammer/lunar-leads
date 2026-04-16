# 🌙 Lunar Leads

![CI](https://github.com/itsmebelprogrammer/lunar-leads/actions/workflows/ci.yml/badge.svg)

**B2B SaaS lead generation platform.**

> **This repository contains a public version of the project.** The proprietary scraper is not included — see the [Scraper](#scraper) section below.

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

The `worker/scraper.py` file in this repository is a **public stub** — it contains only the expected interface, without the real implementation.

To activate the scraper, implement the `scrape_google_maps()` function following the interface documented in the file:

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

## License

This project is made available for study and portfolio purposes. The complete scraper implementation is not included in this public repository.
