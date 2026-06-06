FROM python:3.12-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 libsm6 libxext6 \
    gcc g++ build-essential wget \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-ml.txt .
RUN pip install --no-cache-dir -r requirements-ml.txt

COPY . .
RUN mkdir -p /app/models /app/data/faces

ENV INSIGHTFACE_ROOT=/app/models
ENV HOME=/app

EXPOSE 5001
CMD ["python", "app.py"]
