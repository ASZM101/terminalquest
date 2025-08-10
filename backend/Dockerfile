FROM python:3.11-slim

COPY requirements.txt /app/requirements.txt
WORKDIR /app
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir uvicorn[standard]
COPY . /app
EXPOSE 8000


CMD ["uvicorn", "app:app", "--host", "0.0.0.0"]