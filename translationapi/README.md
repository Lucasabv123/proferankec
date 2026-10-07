# Translation API

A small FastAPI service that translates review comments between English and Spanish with the
Helsinki-NLP Marian models (`opus-mt-en-es`, `opus-mt-es-en`). The Next.js app calls it from the
server when a visitor clicks **Translate** on a review, and stores each translation in the
`ReviewTranslation` table so a comment is only translated once per language.

```
POST /translate   {"text": "...", "source": "es", "target": "en"}  ->  {"translation": "..."}
GET  /health
```

If `TRANSLATION_API_KEY` is set, requests must send the same value in an `X-API-Key` header.

## Run it locally

```bash
cd translationapi
docker build -t proferank-translate .        # downloads torch and both models, a few minutes
docker run -p 8080:8080 -e TRANSLATION_API_KEY=dev proferank-translate
curl -s localhost:8080/translate -H 'X-API-Key: dev' -H 'Content-Type: application/json' \
  -d '{"text":"Muy buen profesor","source":"es","target":"en"}'
```

Then add to `professor/.env`:

```
TRANSLATION_API_URL=http://localhost:8080
TRANSLATION_API_KEY=dev
```

Without `TRANSLATION_API_URL` the app works as before and simply hides the Translate button.

Tests use a stub instead of the models, so they run without torch:

```bash
pip install fastapi httpx pytest && pytest
```

## Deploy on AWS Lambda

The image includes the [Lambda Web Adapter](https://github.com/awslabs/aws-lambda-web-adapter),
so the same container runs on Lambda unchanged. Lambda only charges while a translation runs,
and translations are cached, so this should stay inside the free tier. The trade-off is a cold
start of roughly 10 to 20 seconds after it has been idle; the app waits up to 30 seconds.

1. **Build for Lambda's CPU.** On an Apple Silicon Mac you must build for x86:
   ```bash
   docker buildx build --platform linux/amd64 --provenance=false -t proferank-translate translationapi
   ```
2. **Push to ECR** (replace the region and account id):
   ```bash
   aws ecr create-repository --repository-name proferank-translate
   aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
   docker tag proferank-translate <account>.dkr.ecr.<region>.amazonaws.com/proferank-translate:latest
   docker push <account>.dkr.ecr.<region>.amazonaws.com/proferank-translate:latest
   ```
3. **Create the function** in the Lambda console: *Create function → Container image*, pick the
   image, architecture **x86_64**. Then under *Configuration → General*, set memory to **3008 MB**
   and timeout to **1 min**. Under *Environment variables* add `TRANSLATION_API_KEY` with a long
   random value (`openssl rand -hex 32`).
4. **Give it a URL:** *Configuration → Function URL → Create*, auth type **NONE** (the API key
   protects it). Copy the URL.
5. **Point the app at it:** in Amplify, add the environment variables `TRANSLATION_API_URL`
   (the function URL) and `TRANSLATION_API_KEY` (the same key), and make sure `amplify.yml`
   copies both into `.env.production` with the other server variables. Redeploy.

To ship a new version, rebuild, push, and click *Deploy new image* on the function.

**If cold starts are too slow,** run the same image on AWS App Runner instead (1 vCPU, 3 GB,
port 8080, same environment variable). It stays warm, but costs roughly $15 a month even when idle.
