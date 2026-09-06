from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.routes import face_analysis


VALID_RESULT = {
    "modelVersion": "test-model",
    "inferenceMs": 12,
    "faceCount": 1,
    "primaryFace": {
        "region": {"x": 1, "y": 2, "width": 100, "height": 120},
        "embeddings": {"upper": [0.1], "mid": [0.2], "lower": [0.3]},
        "expression": {
            "dominant": "neutral",
            "confidence": 0.8,
            "probabilities": {"neutral": 0.8},
        },
        "quality": {
            "score": 0.9,
            "blurScore": 0.9,
            "brightnessScore": 0.9,
            "detectionConfidence": 0.95,
            "accepted": True,
            "reasons": [],
        },
    },
}


def client(monkeypatch):
    monkeypatch.setattr(face_analysis, "analyze_image_bytes", lambda _: VALID_RESULT)
    app = FastAPI()
    app.include_router(face_analysis.router)
    return TestClient(app)


def test_analyze_rejects_unsupported_content_type(monkeypatch):
    response = client(monkeypatch).post(
        "/internal/v1/faces/analyze",
        files={"file": ("face.gif", b"GIF89a", "image/gif")},
    )

    assert response.status_code == 415


def test_analyze_rejects_empty_file(monkeypatch):
    response = client(monkeypatch).post(
        "/internal/v1/faces/analyze",
        files={"file": ("face.jpg", b"", "image/jpeg")},
    )

    assert response.status_code == 400


def test_analyze_rejects_file_larger_than_limit(monkeypatch):
    response = client(monkeypatch).post(
        "/internal/v1/faces/analyze",
        files={"file": ("face.jpg", b"0" * (10 * 1024 * 1024 + 1), "image/jpeg")},
    )

    assert response.status_code == 413


def test_analyze_returns_contract_with_trace_and_runtime_fields(monkeypatch):
    response = client(monkeypatch).post(
        "/internal/v1/faces/analyze",
        files={"file": ("face.jpg", b"image-bytes", "image/jpeg")},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["traceId"]
    assert payload["inferenceMs"] == 12
    assert payload["primaryFace"]["region"] == {
        "x": 1,
        "y": 2,
        "width": 100,
        "height": 120,
    }


def test_analyze_maps_invalid_image_to_unprocessable_entity(monkeypatch):
    def fail(_):
        raise ValueError("Tệp tải lên không phải ảnh hợp lệ")

    monkeypatch.setattr(face_analysis, "analyze_image_bytes", fail)
    app = FastAPI()
    app.include_router(face_analysis.router)
    response = TestClient(app).post(
        "/internal/v1/faces/analyze",
        files={"file": ("face.jpg", b"not-an-image", "image/jpeg")},
    )

    assert response.status_code == 422
    assert response.json()["detail"] == "Tệp tải lên không phải ảnh hợp lệ"


def test_analyze_hides_internal_exception_and_returns_trace(monkeypatch):
    def fail(_):
        raise RuntimeError("secret model failure")

    monkeypatch.setattr(face_analysis, "analyze_image_bytes", fail)
    app = FastAPI()
    app.include_router(face_analysis.router)
    response = TestClient(app).post(
        "/internal/v1/faces/analyze",
        files={"file": ("face.jpg", b"image-bytes", "image/jpeg")},
    )

    assert response.status_code == 500
    assert "traceId=" in response.json()["detail"]
    assert "secret model failure" not in response.json()["detail"]
