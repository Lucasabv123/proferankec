FROM python:3.12-slim

# lets the same image run on AWS Lambda (it forwards Lambda events to the web server on port 8080);
# on App Runner, ECS or locally it does nothing
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.4 /lambda-adapter /opt/extensions/lambda-adapter

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# download both models at build time so the service never fetches them at runtime
# (Lambda's filesystem is read-only, and a cold start shouldn't wait on Hugging Face)
ENV HF_HOME=/models
COPY main.py .
RUN python -c "import main; [main.get_translator(s, t) for s, t in main.MODELS]"
ENV HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 PORT=8080

EXPOSE 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
