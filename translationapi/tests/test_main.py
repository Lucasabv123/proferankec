# Runs without torch or the models: the translator is replaced with a stub.
#   pip install fastapi httpx pytest && pytest
import importlib

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client(monkeypatch):
    def load(api_key=""):
        monkeypatch.setenv("TRANSLATION_API_KEY", api_key)
        import main

        importlib.reload(main)
        monkeypatch.setattr(main, "translate", lambda text, source, target: f"[{source}->{target}] {text}")
        return TestClient(main.app)

    return load


def test_translates(client):
    res = client().post("/translate", json={"text": "Hola", "source": "es", "target": "en"})
    assert res.status_code == 200
    assert res.json() == {"translation": "[es->en] Hola"}


def test_same_language_returns_text(client):
    res = client().post("/translate", json={"text": "Hello", "source": "en", "target": "en"})
    assert res.json() == {"translation": "Hello"}


def test_rejects_bad_input(client):
    c = client()
    assert c.post("/translate", json={"text": "", "source": "es", "target": "en"}).status_code == 422
    assert c.post("/translate", json={"text": "x", "source": "fr", "target": "en"}).status_code == 422
    assert c.post("/translate", json={"text": "x" * 2001, "source": "es", "target": "en"}).status_code == 422


def test_api_key(client):
    c = client(api_key="secret")
    body = {"text": "Hola", "source": "es", "target": "en"}
    assert c.post("/translate", json=body).status_code == 401
    assert c.post("/translate", json=body, headers={"X-API-Key": "wrong"}).status_code == 401
    assert c.post("/translate", json=body, headers={"X-API-Key": "secret"}).status_code == 200
    assert c.get("/health").status_code == 200
