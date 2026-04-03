FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Port configuration
ARG PORT=8000
ENV PORT=$PORT

# Expose auth service port
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD python -c "import ssl, urllib.request; urllib.request.urlopen('https://localhost:' + '$PORT' + '/docs', context=ssl._create_unverified_context())" || exit 1

# Start FastAPI with uvicorn (production mode, no reload)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port $PORT --ssl-keyfile /app/certs/server.key --ssl-certfile /app/certs/server.crt"]
