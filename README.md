# 🌙 Lunar Leads

Plataforma SaaS de geração de leads B2B.

> **Este repositório contém uma versão pública do projeto.**
> O scraper proprietário não está incluído — veja a seção [Scraper](#scraper) abaixo.

---

## O que é

O Lunar Leads permite que pequenas empresas e profissionais de vendas gerem listas de leads qualificados em minutos. O usuário escolhe um estado, um nicho de mercado e o sistema busca empresas automaticamente e entrega um arquivo CSV com nome, telefone, site e link direto para WhatsApp.

## Stack

| Camada | Tecnologia |
|---|---|
| API | FastAPI + Python |
| Banco | PostgreSQL |
| ORM | SQLAlchemy 2.0 async |
| Migrations | Alembic |
| Auth | JWT |
| Worker | Celery + Redis |
| Frontend | Angular 17+ |

## Funcionalidades

- Cadastro e login com JWT
- Controle de cota mensal por usuário
- Criação de listas de leads por estado + nicho 
- Processamento assíncrono via Celery
- Download CSV com leads gerados
- Painel admin com cota ilimitada

## Como rodar localmente

### Pré-requisitos

- Python 3.11+
- Node.js 18+
- Docker

### Backend

```bash
cd apps/api

# Criar ambiente virtual
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Instalar dependências
pip install -r requirements.txt

# Copiar e preencher variáveis de ambiente
cp .env.example .env

# Subir banco e Redis
docker-compose -f ../../infra/docker-compose.yml up -d

# Aplicar migrations
alembic upgrade head

# Popular estados e nichos
python scripts/seed.py

# Rodar API
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

Acesse em `http://localhost:4200`

## Scraper

O arquivo `worker/scraper.py` presente neste repositório é um **stub público** — contém apenas a interface esperada, sem a implementação real.

Para ativar o scraper, implemente a função `scrape_google_maps()` seguindo a interface documentada no arquivo:

```python
def scrape_google_maps(niche_label: str, state_name: str, limit: int = 50) -> list[dict]:
    # Retorna lista de dicts com keys:
    # name, phone, website, whatsapp
    ...
```

## Estrutura do projeto

```
lunar/
├── apps/
│   └── api/          ← Backend FastAPI
│       ├── app/      ← Models, routers, schemas, services
│       ├── worker/   ← Celery + scraper (stub)
│       └── alembic/  ← Migrations do banco
├── web/              ← Frontend Angular 17+
└── infra/            ← Docker Compose
```

## Licença

Este projeto é disponibilizado para fins de estudo e apresentação.
A implementação completa do scraper não está incluída neste repositório público.