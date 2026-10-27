FROM python:3.13-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080

WORKDIR /app
COPY server.py ./
COPY app/ ./app/

EXPOSE 8080
CMD ["python", "server.py"]
