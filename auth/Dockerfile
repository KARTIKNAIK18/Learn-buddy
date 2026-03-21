FROM python:3.12-slim AS main

WORKDIR /app

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim

WORKDIR /app

COPY --from=main /usr/local/ /usr/local/

COPY . .

EXPOSE 8000

CMD ["python", "run.py"]

