"""
test_app.py — Quiz/Trivia API Test Suite
=========================================
Covers: player registration, question management, quiz logic,
        streak mechanics, accuracy calculation, and the leaderboard.

Why pytest fixtures?
  - The `client` fixture gives each test a fresh Flask test client.
  - The `seeded` fixture builds on `client` and pre-loads one question
    and two players, so tests that care about game logic don't have to
    repeat that setup themselves.
"""

import pytest
from app import app, _reset


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def client():
    """Fresh Flask test client with a clean in-memory state."""
    app.config["TESTING"] = True
    _reset()
    with app.test_client() as c:
        yield c


@pytest.fixture
def seeded(client):
    """
    Client with one question and two players already registered.
    Returns (client, question_id) so tests can reference the question.
    """
    # Add a question
    r = client.post("/questions", json={
        "question": "What is the capital of France?",
        "options":  ["Berlin", "Paris", "Rome", "Madrid"],
        "answer":   "Paris",
        "category": "geography",
    })
    qid = r.get_json()["id"]

    # Register two players
    client.post("/players", json={"name": "Pema"})
    client.post("/players", json={"name": "Dorji"})

    return client, qid


# ---------------------------------------------------------------------------
# 1. Health check
# ---------------------------------------------------------------------------

def test_health_check(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.get_json()["status"] == "healthy"


# ---------------------------------------------------------------------------
# 2. Player registration
# ---------------------------------------------------------------------------

def test_register_player_success(client):
    r = client.post("/players", json={"name": "Pema"})
    assert r.status_code == 201
    assert r.get_json()["player"] == "Pema"


def test_register_player_missing_name(client):
    """Body with no 'name' key should return 400."""
    r = client.post("/players", json={})
    assert r.status_code == 400
    assert "error" in r.get_json()


def test_register_player_blank_name(client):
    """Whitespace-only name should be rejected."""
    r = client.post("/players", json={"name": "   "})
    assert r.status_code == 400


def test_register_duplicate_player(client):
    """Registering the same name twice should return 409 Conflict."""
    client.post("/players", json={"name": "Pema"})
    r = client.post("/players", json={"name": "Pema"})
    assert r.status_code == 409


# ---------------------------------------------------------------------------
# 3. Player stats
# ---------------------------------------------------------------------------

def test_player_stats_initial(client):
    """Freshly registered player should have 0 score, 0 streak, 0% accuracy."""
    client.post("/players", json={"name": "Pema"})
    r = client.get("/players/Pema/stats")
    data = r.get_json()
    assert r.status_code == 200
    assert data["score"]    == 0
    assert data["streak"]   == 0
    assert data["accuracy"] == 0.0


def test_player_stats_not_found(client):
    """Fetching stats for a non-existent player should return 404."""
    r = client.get("/players/Ghost/stats")
    assert r.status_code == 404


def test_accuracy_no_division_by_zero(client):
    """accuracy must be 0.0 (not a crash) when attempts == 0."""
    client.post("/players", json={"name": "Pema"})
    data = client.get("/players/Pema/stats").get_json()
    assert data["accuracy"] == 0.0   # must not raise ZeroDivisionError


# ---------------------------------------------------------------------------
# 4. Adding questions
# ---------------------------------------------------------------------------

def test_add_question_success(client):
    r = client.post("/questions", json={
        "question": "What is 2 + 2?",
        "options":  ["2", "3", "4", "5"],
        "answer":   "4",
    })
    assert r.status_code == 201
    assert "id" in r.get_json()


def test_add_question_missing_field(client):
    """Missing 'answer' field should return 400."""
    r = client.post("/questions", json={
        "question": "What is 2 + 2?",
        "options":  ["2", "3", "4", "5"],
    })
    assert r.status_code == 400


def test_add_question_too_few_options(client):
    """Only one option — must have at least 2."""
    r = client.post("/questions", json={
        "question": "Only option?",
        "options":  ["Yes"],
        "answer":   "Yes",
    })
    assert r.status_code == 400


def test_add_question_answer_not_in_options(client):
    """answer must be one of the options, not an arbitrary string."""
    r = client.post("/questions", json={
        "question": "Colour of sky?",
        "options":  ["Red", "Green"],
        "answer":   "Blue",   # ← not in options
    })
    assert r.status_code == 400


def test_answer_hidden_in_list(client):
    """GET /questions must NOT expose the correct answer."""
    client.post("/questions", json={
        "question": "What is 2 + 2?",
        "options":  ["2", "3", "4", "5"],
        "answer":   "4",
    })
    r = client.get("/questions")
    for q in r.get_json()["questions"]:
        assert "answer" not in q


def test_get_question_not_found(client):
    """Fetching a non-existent question ID should return 404."""
    r = client.get("/questions/999")
    assert r.status_code == 404


def test_filter_questions_by_category(client):
    """?category= filter should return only matching questions."""
    client.post("/questions", json={"question": "Q1", "options": ["A","B"], "answer": "A", "category": "math"})
    client.post("/questions", json={"question": "Q2", "options": ["A","B"], "answer": "A", "category": "science"})
    r = client.get("/questions?category=math")
    data = r.get_json()
    assert data["count"] == 1
    assert data["questions"][0]["category"] == "math"


# ---------------------------------------------------------------------------
# 5. Answering questions (core game logic)
# ---------------------------------------------------------------------------

def test_correct_answer_adds_score(seeded):
    client, qid = seeded
    r = client.post("/quiz/answer", json={"player": "Pema", "question_id": qid, "answer": "Paris"})
    data = r.get_json()
    assert r.status_code == 200
    assert data["correct"] is True
    assert data["score"]   == 10


def test_wrong_answer_no_score(seeded):
    client, qid = seeded
    r = client.post("/quiz/answer", json={"player": "Pema", "question_id": qid, "answer": "Berlin"})
    data = r.get_json()
    assert data["correct"] is False
    assert data["score"]   == 0


def test_invalid_option_rejected(seeded):
    """Submitting an option not in the question's list should return 400."""
    client, qid = seeded
    r = client.post("/quiz/answer", json={"player": "Pema", "question_id": qid, "answer": "Tokyo"})
    assert r.status_code == 400


def test_answer_nonexistent_player(seeded):
    client, qid = seeded
    r = client.post("/quiz/answer", json={"player": "Ghost", "question_id": qid, "answer": "Paris"})
    assert r.status_code == 404


def test_answer_nonexistent_question(seeded):
    client, _ = seeded
    r = client.post("/quiz/answer", json={"player": "Pema", "question_id": 999, "answer": "Paris"})
    assert r.status_code == 404


# ---------------------------------------------------------------------------
# 6. Streak mechanics
# ---------------------------------------------------------------------------

def test_streak_increments_on_correct(seeded):
    """Three correct answers → streak should be 3."""
    client, qid = seeded
    for _ in range(3):
        client.post("/quiz/answer", json={"player": "Pema", "question_id": qid, "answer": "Paris"})
    stats = client.get("/players/Pema/stats").get_json()
    assert stats["streak"] == 3


def test_streak_resets_on_wrong_answer(seeded):
    """Correct, correct, WRONG → streak must reset to 0."""
    client, qid = seeded
    client.post("/quiz/answer", json={"player": "Pema", "question_id": qid, "answer": "Paris"})
    client.post("/quiz/answer", json={"player": "Pema", "question_id": qid, "answer": "Paris"})
    client.post("/quiz/answer", json={"player": "Pema", "question_id": qid, "answer": "Berlin"})  # wrong
    data = client.get("/players/Pema/stats").get_json()
    assert data["streak"] == 0


# ---------------------------------------------------------------------------
# 7. Accuracy calculation
# ---------------------------------------------------------------------------

def test_accuracy_after_mixed_answers(seeded):
    """2 correct out of 4 attempts → accuracy should be 50.0."""
    client, qid = seeded
    client.post("/quiz/answer", json={"player": "Pema", "question_id": qid, "answer": "Paris"})   # correct
    client.post("/quiz/answer", json={"player": "Pema", "question_id": qid, "answer": "Paris"})   # correct
    client.post("/quiz/answer", json={"player": "Pema", "question_id": qid, "answer": "Berlin"})  # wrong
    client.post("/quiz/answer", json={"player": "Pema", "question_id": qid, "answer": "Rome"})    # wrong
    stats = client.get("/players/Pema/stats").get_json()
    assert stats["accuracy"] == 50.0


# ---------------------------------------------------------------------------
# 8. Leaderboard
# ---------------------------------------------------------------------------

def test_leaderboard_empty(client):
    r = client.get("/leaderboard")
    assert r.status_code == 200
    assert r.get_json()["leaderboard"] == []


def test_leaderboard_sorted_by_score(seeded):
    """Pema answers correctly, Dorji doesn't — Pema should rank first."""
    client, qid = seeded
    client.post("/quiz/answer", json={"player": "Pema",  "question_id": qid, "answer": "Paris"})
    client.post("/quiz/answer", json={"player": "Dorji", "question_id": qid, "answer": "Berlin"})
    board = client.get("/leaderboard").get_json()["leaderboard"]
    assert board[0]["player"] == "Pema"
    assert board[0]["score"]  == 10
    assert board[1]["score"]  == 0
