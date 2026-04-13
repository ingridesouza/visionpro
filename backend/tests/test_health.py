import sys
import os

# Ensure backend modules are importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "uptime_seconds" in data


def test_readiness_endpoint(client):
    response = client.get("/health/ready")
    assert response.status_code == 200
    data = response.json()
    assert "ready" in data
    assert "detectors" in data
