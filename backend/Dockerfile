FROM python:3.12-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev curl wget && rm -rf /var/lib/apt/lists/*
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh \
    /usr/local/bin/wait-for-it.sh
RUN chmod +x /usr/local/bin/wait-for-it.sh
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN mkdir -p /app/uploads/photos /app/uploads/bulletins
EXPOSE 8000
CMD ["sh", "-c", "wait-for-it.sh postgres:5432 --timeout=60 -- uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2"]
