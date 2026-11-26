FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY backend/requirements-lock.txt ./requirements-lock.txt
RUN pip install --no-cache-dir -r requirements-lock.txt
COPY backend/app ./app
COPY sample-applications/legacy-inventory ./sample-applications/legacy-inventory
RUN useradd --create-home --uid 10001 appuser && mkdir /data && chown -R appuser:appuser /app /data
USER 10001
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
