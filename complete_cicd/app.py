from flask import Flask, jsonify, request

app = Flask(__name__)

# ---------------------------------------------------------------------------
# In-memory "database"
# In a real project this would be a proper DB (PostgreSQL, SQLite, etc.).
# For this assignment, plain dicts are fine — and easier to reset in tests.
# ---------------------------------------------------------------------------
questions = {}   # { id: { question, options, answer, category } }
players   = {}   # { name: { score, streak, correct, attempts } }
_next_qid = [1]  # mutable list so helpers can increment it


def _reset():
    """Wipe all state — called by tests between runs."""
    questions.clear()
    players.clear()
    _next_qid[0] = 1


# ---------------------------------------------------------------------------
# PLAYER routes
# ---------------------------------------------------------------------------

@app.route("/players", methods=["POST"])
def register_player():
    """
    Register a new player.
    Body: { "name": "Pema" }
    Rules:
      - name is required
      - duplicate names are rejected (409 Conflict)
    """
    data = request.get_json()

    if not data or "name" not in data or not data["name"].strip():
        return jsonify({"error": "name is required"}), 400

    name = data["name"].strip()

    if name in players:
        return jsonify({"error": f"Player '{name}' already exists"}), 409

    players[name] = {"score": 0, "streak": 0, "correct": 0, "attempts": 0}
    return jsonify({"message": f"Player '{name}' registered", "player": name}), 201


@app.route("/players/<name>/stats")
def player_stats(name):
    """
    Return a player's score, streak, and accuracy percentage.
    Accuracy = correct / attempts * 100  (guarded against division by zero)
    """
    if name not in players:
        return jsonify({"error": f"Player '{name}' not found"}), 404

    p = players[name]
    accuracy = round(p["correct"] / p["attempts"] * 100, 1) if p["attempts"] > 0 else 0.0

    return jsonify({
        "player":   name,
        "score":    p["score"],
        "streak":   p["streak"],
        "correct":  p["correct"],
        "attempts": p["attempts"],
        "accuracy": accuracy,
    })


# ---------------------------------------------------------------------------
# QUESTION routes
# ---------------------------------------------------------------------------

@app.route("/questions", methods=["POST"])
def add_question():
    """
    Add a trivia question.
    Body: {
      "question": "What is 2+2?",
      "options":  ["1", "2", "4", "8"],
      "answer":   "4",
      "category": "math"          ← optional, defaults to "general"
    }
    Rules:
      - question, options, answer are required
      - must have at least 2 options
      - answer must be one of the options
    """
    data = request.get_json()

    for field in ("question", "options", "answer"):
        if not data or field not in data:
            return jsonify({"error": f"'{field}' is required"}), 400

    if not isinstance(data["options"], list) or len(data["options"]) < 2:
        return jsonify({"error": "at least 2 options are required"}), 400

    if data["answer"] not in data["options"]:
        return jsonify({"error": "answer must be one of the options"}), 400

    qid = _next_qid[0]
    _next_qid[0] += 1

    questions[qid] = {
        "id":       qid,
        "question": data["question"],
        "options":  data["options"],
        "answer":   data["answer"],
        "category": data.get("category", "general"),
    }
    return jsonify({"message": "Question added", "id": qid}), 201


@app.route("/questions")
def list_questions():
    """
    List all questions.
    Optional query param: ?category=science
    The answer is NOT returned here (that would be cheating).
    """
    category = request.args.get("category")
    result = [
        {k: v for k, v in q.items() if k != "answer"}
        for q in questions.values()
        if category is None or q["category"] == category
    ]
    return jsonify({"questions": result, "count": len(result)})


@app.route("/questions/<int:qid>")
def get_question(qid):
    """Get a single question by ID (answer hidden)."""
    if qid not in questions:
        return jsonify({"error": f"Question {qid} not found"}), 404

    q = {k: v for k, v in questions[qid].items() if k != "answer"}
    return jsonify(q)


# ---------------------------------------------------------------------------
# QUIZ route — the core game logic
# ---------------------------------------------------------------------------

@app.route("/quiz/answer", methods=["POST"])
def submit_answer():
    """
    Submit an answer to a question.
    Body: {
      "player":      "Pema",
      "question_id": 1,
      "answer":      "4"
    }
    Logic:
      - Player and question must exist
      - Answer must be one of the question's options (can't submit garbage)
      - Correct → +10 points, streak increments
      - Wrong   → streak resets to 0, no points
    """
    data = request.get_json()

    for field in ("player", "question_id", "answer"):
        if not data or field not in data:
            return jsonify({"error": f"'{field}' is required"}), 400

    name = data["player"]
    qid  = data["question_id"]
    ans  = data["answer"]

    if name not in players:
        return jsonify({"error": f"Player '{name}' not found"}), 404

    if qid not in questions:
        return jsonify({"error": f"Question {qid} not found"}), 404

    q = questions[qid]

    if ans not in q["options"]:
        return jsonify({"error": "answer must be one of the question's options"}), 400

    p = players[name]
    p["attempts"] += 1
    correct = ans == q["answer"]

    if correct:
        p["correct"] += 1
        p["score"]   += 10
        p["streak"]  += 1
    else:
        p["streak"] = 0  # ← streak resets on any wrong answer

    return jsonify({
        "correct":        correct,
        "correct_answer": q["answer"],
        "score":          p["score"],
        "streak":         p["streak"],
    })


# ---------------------------------------------------------------------------
# LEADERBOARD route
# ---------------------------------------------------------------------------

@app.route("/leaderboard")
def leaderboard():
    """
    Return all players sorted by score (descending).
    Ties broken by name alphabetically.
    """
    board = sorted(
        [{"player": name, "score": p["score"], "streak": p["streak"]} for name, p in players.items()],
        key=lambda x: (-x["score"], x["player"])
    )
    return jsonify({"leaderboard": board})


# ---------------------------------------------------------------------------
# HEALTH check (kept from original)
# ---------------------------------------------------------------------------

@app.route("/health")
def health():
    return jsonify({"status": "healthy"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
