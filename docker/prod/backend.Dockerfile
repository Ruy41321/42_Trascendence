FROM python:3.12-slim

WORKDIR /app

# Port configuration
ARG PORT=3000
ENV PORT=$PORT

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose WebSocket port
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import ssl, urllib.request; urllib.request.urlopen('https://localhost:' + '$PORT' + '/docs', context=ssl._create_unverified_context())"

# Start FastAPI with uvicorn (production mode, no reload)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port $PORT --ssl-keyfile /app/certs/server.key --ssl-certfile /app/certs/server.crt"]
