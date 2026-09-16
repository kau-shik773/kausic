FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y ffmpeg curl && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PORT=5050
EXPOSE 5050
CMD ["gunicorn", "--workers", "4", "--timeout", "120", "--bind", "0.0.0.0:5050", "server:app"]
