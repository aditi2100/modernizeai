from fastapi.testclient import TestClient

from app.database import Base, SessionLocal, engine
from app.main import app
from app.models import Workspace

client = TestClient(app)


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def test_analysis_persists_evidence_and_events():
    response = client.post("/api/projects/legacy-inventory/analyze")
    assert response.status_code == 200
    project = response.json()
    assert project["analyzed"] is True
    assert len(project["findings"]) == 4
    assert project["findings"][0]["file"].endswith("InventoryApp.java")
    assert project["findings"][0]["line"] > 0
    assert project["events"][0]["action"] == "Deterministic source analysis completed"


def test_patch_requires_approval_and_records_applied_workspace():
    blocked = client.post("/api/projects/legacy-inventory/apply")
    assert blocked.status_code == 403

    client.post("/api/projects/legacy-inventory/analyze")
    approved = client.post("/api/projects/legacy-inventory/approve")
    assert approved.status_code == 200
    applied = client.post("/api/projects/legacy-inventory/apply")
    assert applied.status_code == 200
    assert applied.json()["applied"] is True
    with SessionLocal() as db:
        workspace = db.get(Workspace, "legacy-inventory")
        assert "public boolean isLowStock()" in workspace.source_json


def test_patch_cannot_be_applied_twice():
    client.post("/api/projects/legacy-inventory/analyze")
    client.post("/api/projects/legacy-inventory/approve")
    client.post("/api/projects/legacy-inventory/apply")
    repeated = client.post("/api/projects/legacy-inventory/apply")
    assert repeated.status_code == 409


def test_unavailable_project_is_not_accepted():
    response = client.post("/api/projects/untrusted/analyze")
    assert response.status_code == 404


def test_health_endpoint_labels_demo_mode():
    assert client.get("/api/health").json() == {"status": "ok", "mode": "deterministic-demo"}


def test_reset_restores_unmodified_demo_workspace():
    client.post("/api/projects/legacy-inventory/analyze")
    client.post("/api/projects/legacy-inventory/approve")
    client.post("/api/projects/legacy-inventory/apply")
    reset = client.post("/api/projects/legacy-inventory/reset")
    assert reset.status_code == 200
    assert reset.json()["analyzed"] is False
    assert reset.json()["approved"] is False
    assert reset.json()["applied"] is False
    assert reset.json()["findings"] == []
    assert reset.json()["events"] == []
