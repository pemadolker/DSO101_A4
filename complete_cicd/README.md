# Quiz/Trivia API — CI/CD Pipeline (DSO101)

A RESTful Quiz/Trivia backend built with Flask, tested with pytest, and deployed automatically to Render via GitHub Actions.

---

## Project Structure

```
cicd-project/
├── app.py                        # Flask application
├── test_app.py                   # pytest test suite (25 tests)
├── requirements.txt              # Python dependencies
├── render.yaml                   # Render deployment config
└── .github/
    └── workflows/
        └── ci.yml                # GitHub Actions CI/CD pipeline
```

---

## API Endpoints

### Players
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/players` | Register a new player |
| GET | `/players/<name>/stats` | Get score, streak, and accuracy |

### Questions
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/questions` | Add a trivia question |
| GET | `/questions` | List all questions (answer hidden) |
| GET | `/questions/<id>` | Get a single question |
| GET | `/questions?category=X` | Filter questions by category |

### Game
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/quiz/answer` | Submit an answer |
| GET | `/leaderboard` | Ranked player leaderboard |
| GET | `/health` | Health check |

---

## Game Logic

- **Scoring:** +10 points per correct answer
- **Streak:** increments on consecutive correct answers; resets to 0 on any wrong answer
- **Accuracy:** `(correct / total attempts) × 100`, safe against division by zero
- **Leaderboard:** sorted by score descending, ties broken alphabetically
- **Answer security:** the correct answer is never exposed in `GET /questions` responses

---

## Running Locally

```bash
pip install -r requirements.txt
python app.py
```

## Running Tests

```bash
pytest test_app.py -v
```

---

## CI/CD Pipeline

Every push to `main` triggers the GitHub Actions workflow which:

1. Checks out the code
2. Sets up Python 3.9
3. Caches pip dependencies (faster subsequent runs)
4. Installs dependencies from `requirements.txt`
5. Runs the full test suite with `pytest`
6. On success, triggers auto-deploy to Render via a deploy hook stored as a GitHub Secret

The deploy step only runs on pushes to `main` (not on pull requests), so broken branches never reach production.

---

## Deployment

Live URL: `https://<your-render-url>.onrender.com`

Deployed on [Render](https://render.com) using `gunicorn` as the WSGI server. The `render.yaml` file in this repo configures the service automatically.

### Setting up the deploy hook (one-time)
1. In Render → your service → **Settings** → copy the **Deploy Hook URL**
2. In GitHub → your repo → **Settings → Secrets → Actions** → add `RENDER_DEPLOY_HOOK_URL`
