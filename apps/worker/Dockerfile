FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy poetry files
COPY pyproject.toml poetry.lock* ./

# Install poetry and dependencies
RUN pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-dev

# Copy application code
COPY worker/ ./worker/

# Expose port
EXPOSE 8420

# Run the application
CMD ["uvicorn", "worker.main:app", "--host", "0.0.0.0", "--port", "8420"]
