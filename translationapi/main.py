"""English <-> Spanish translation service for Profe Rank review comments.

The Next.js app calls POST /translate from the server; browsers never call this directly.
Models are the Helsinki-NLP Marian models, baked into the Docker image at build time.
"""

import hmac
import os
from functools import lru_cache
from typing import Literal

from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

MODELS = {
    ("en", "es"): "Helsinki-NLP/opus-mt-en-es",
    ("es", "en"): "Helsinki-NLP/opus-mt-es-en",
}
MAX_TEXT_LENGTH = 2000  # review comments are capped at 500 characters

# when set, requests must send it in the X-API-Key header
API_KEY = os.environ.get("TRANSLATION_API_KEY", "")

Language = Literal["en", "es"]


class TranslationRequest(BaseModel):
    text: str = Field(min_length=1, max_length=MAX_TEXT_LENGTH)
    source: Language
    target: Language


class TranslationResponse(BaseModel):
    translation: str


@lru_cache(maxsize=None)
def get_translator(source: str, target: str):
    # imported here so the app (and its tests) start without loading torch
    from transformers import pipeline

    return pipeline(f"translation_{source}_to_{target}", model=MODELS[(source, target)])


def translate(text: str, source: str, target: str) -> str:
    return get_translator(source, target)(text, max_length=1024)[0]["translation_text"]


def check_api_key(x_api_key: str = Header(default="")):
    if API_KEY and not hmac.compare_digest(x_api_key, API_KEY):
        raise HTTPException(status_code=401, detail="Invalid API key")


app = FastAPI(title="Profe Rank translation API")


@app.get("/health")
def health():
    return {"ok": True}


# a plain def runs in a worker thread, so a slow translation doesn't block other requests
@app.post("/translate", response_model=TranslationResponse, dependencies=[Depends(check_api_key)])
def translate_endpoint(body: TranslationRequest):
    if body.source == body.target:
        return TranslationResponse(translation=body.text)
    return TranslationResponse(translation=translate(body.text, body.source, body.target))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "8080")))
