import json
import io
import pytest
from fastapi.testclient import TestClient
from main import app

# Setup a fixture to run the database initialization and yield TestClient inside a context manager
@pytest.fixture(scope="module")
def client():
    # Force initialize the DB in case startup event doesn't trigger
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_ai_status(client):
    response = client.get("/ai-status")
    assert response.status_code == 200
    assert "configured" in response.json()

def test_sample_data(client):
    response = client.get("/sample-data")
    assert response.status_code == 200
    data = response.json()
    assert "stock" in data
    assert "routes" in data
    assert "company_rules" in data

def test_upload_and_analyze_flow(client):
    # 1. Fetch sample data
    sample_response = client.get("/sample-data")
    assert sample_response.status_code == 200
    sample_data = sample_response.json()

    # 2. Upload sample data as a JSON file
    file_content = json.dumps(sample_data).encode("utf-8")
    file_like = io.BytesIO(file_content)
    
    upload_response = client.post(
        "/upload-data",
        files={"file": ("sample.json", file_like, "application/json")}
    )
    if upload_response.status_code != 200:
        print("Upload Error Details:", upload_response.json())
    assert upload_response.status_code == 200
    upload_result = upload_response.json()
    assert upload_result["status"] == "success"
    op_id = upload_result["operation_id"]
    assert op_id is not None

    # 3. Trigger analyze
    analyze_response = client.post(
        f"/analyze?operation_id={op_id}"
    )
    assert analyze_response.status_code == 200
    analyze_result = analyze_response.json()
    assert analyze_result["status"] == "success"
    assert "insights" in analyze_result
    assert "suggestions" in analyze_result
    assert "raw_data" in analyze_result

    # 4. Try applying a suggestion
    suggestions = analyze_result["suggestions"]
    if suggestions:
        sug_id = suggestions[0]["id"]
        apply_payload = {
            "operation_id": op_id,
            "suggestion_id": sug_id
        }
        apply_response = client.post(
            "/apply",
            json=apply_payload
        )
        assert apply_response.status_code == 200
        assert apply_response.json()["status"] == "success"
