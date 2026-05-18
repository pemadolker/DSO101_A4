import pytest
from app import app


# --- Fixture ---
# A pytest "fixture" is a reusable setup block. Here we create a test
# client so each test function gets a fresh Flask test environment.
@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


# --- Tests ---

def test_home_status_code(client):
    """Home route should return HTTP 200 OK."""
    response = client.get("/")
    assert response.status_code == 200


def test_home_returns_json(client):
    """Home route should return JSON with a 'message' key."""
    response = client.get("/")
    data = response.get_json()
    assert "message" in data
    assert data["status"] == "success"


def test_health_check(client):
    """Health endpoint should return {'status': 'healthy'}."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.get_json()["status"] == "healthy"


def test_add_route(client):
    """/add/<a>/<b> should return the correct sum."""
    response = client.get("/add/3/7")
    assert response.status_code == 200
    assert response.get_json()["result"] == 10


def test_add_route_zero(client):
    """Adding zero should work correctly."""
    response = client.get("/add/0/5")
    assert response.get_json()["result"] == 5


def test_arithmetic_sanity():
    """Baseline sanity check (mirrors the sample in the brief)."""
    assert 1 + 1 == 2
