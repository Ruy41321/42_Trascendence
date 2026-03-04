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

# Start FastAPI with uvicorn (hot reload enabled for dev)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port $PORT --reload"]
