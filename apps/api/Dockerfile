FROM python:3.11-slim

WORKDIR /app

COPY requirements-prod.txt .
RUN pip install --no-cache-dir -r requirements-prod.txt

COPY . .

RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
RUN chmod +x start.sh
USER appuser

EXPOSE 8000

CMD ["sh", "start.sh"]