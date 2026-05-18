# CI/CD Pipeline — DSO101 Assignment IV

**Course:** DevSecOps (DSO101)  
**Programme:** Bachelor of Engineering in Software Engineering  
**Assignment:** Build a Complete CI/CD Pipeline with Testing & Deployment

---

## Overview

This project demonstrates a production-style **Continuous Integration / Continuous Deployment (CI/CD) pipeline** built around a lightweight Flask web API. Every `git push` to the `main` branch automatically triggers:

1. A fresh Python environment on GitHub Actions
2. Dependency installation
3. The full pytest test suite
4. A live deployment to Render (if all tests pass)

No manual steps are needed after the initial setup.

---

## Project Structure

```
project/
├── app.py                        # Flask application (3 routes)
├── test_app.py                   # pytest test suite (6 tests)
├── requirements.txt              # Python dependencies
├── render.yaml                   # Render deployment config
└── .github/
    └── workflows/
        └── ci.yml                # GitHub Actions pipeline definition
```

---

## Application Routes

| Route         | Method | Description                          | Response Example                        |
|---------------|--------|--------------------------------------|-----------------------------------------|
| `/`           | GET    | Home — confirms deployment is live   | `{"message": "CI/CD Pipeline is live!"}` |
| `/health`     | GET    | Health check for uptime monitoring   | `{"status": "healthy"}`                 |
| `/add/<a>/<b>`| GET    | Adds two integers (tests logic path) | `{"result": 10}`                        |

---

## Running Locally

**Prerequisites:** Python 3.9+

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the app
python app.py
# → App running at http://localhost:5000

# 4. Run the tests
pytest test_app.py -v
```

---

## CI/CD Pipeline Explained

### What is CI/CD?

**Continuous Integration (CI)** is the practice of automatically building and testing code on every push. It catches bugs early — before they reach production.

**Continuous Deployment (CD)** extends CI by automatically pushing passing builds to a live environment. This removes the human bottleneck of manual releases.

### Pipeline Stages

```
git push → GitHub Actions triggered
               │
               ▼
         [1] Checkout code
               │
               ▼
         [2] Set up Python 3.9
               │
               ▼
         [3] pip install -r requirements.txt
               │
               ▼
         [4] pytest test_app.py -v
               │
        ┌──────┴──────┐
      FAIL           PASS
        │               │
    Pipeline        [5] curl Render
    stops               deploy hook
    (no deploy)         │
                        ▼
                  Live app updated
```

### Trigger Configuration (`ci.yml`)

The pipeline is configured to trigger on:
- **Push** to `main` — runs CI + CD
- **Pull Request** to `main` — runs CI only (no deploy, for safety)

### Secrets Management

The Render deploy hook URL is stored as a **GitHub Secret** (`RENDER_DEPLOY_HOOK_URL`), never hardcoded in the workflow file. This prevents exposure of sensitive credentials in version-controlled code.

---

## Deployment (Render)

Render is a cloud platform that hosts web services. It is configured via `render.yaml`.

**One-time setup steps:**

1. Push this repository to GitHub
2. Sign in at [render.com](https://render.com) → **New Web Service** → connect your GitHub repo
3. Render detects `render.yaml` and configures itself automatically
4. Copy the **Deploy Hook URL** from Render's dashboard
5. Add it as a secret in GitHub: **Settings → Secrets → Actions → New secret** → name: `RENDER_DEPLOY_HOOK_URL`

After setup, every push to `main` that passes tests will deploy automatically.

---

## Test Suite

Tests are written using **pytest** and Flask's built-in test client.

| Test | What it verifies |
|------|-----------------|
| `test_home_status_code` | `/` returns HTTP 200 |
| `test_home_returns_json` | `/` returns valid JSON with `message` and `status` keys |
| `test_health_check` | `/health` returns `{"status": "healthy"}` |
| `test_add_route` | `/add/3/7` returns `{"result": 10}` |
| `test_add_route_zero` | Adding zero works correctly |
| `test_arithmetic_sanity` | Baseline sanity check (from assignment brief) |

Run locally with:
```bash
pytest test_app.py -v
```

---

## Tools & Technologies

| Tool | Role |
|------|------|
| **Flask** | Lightweight Python web framework |
| **pytest** | Python testing framework |
| **GitHub Actions** | CI/CD automation (runs on push) |
| **Render** | Cloud deployment platform |
| **Gunicorn** | Production-grade WSGI server for Flask |

---

## Marking Scheme Mapping

| Criteria | Implementation |
|----------|---------------|
| Project structure (2) | Follows required layout: `app.py`, `test_app.py`, `requirements.txt`, `.github/workflows/ci.yml` |
| CI pipeline — build + test (3) | `ci.yml` installs deps, runs pytest, fails pipeline on test failure |
| Test implementation (2) | 6 pytest tests covering all routes + sanity check |
| Deployment automation (2) | Render deploy hook triggered by GitHub Actions only on passing tests |
| Documentation (1) | This README |

---

*Assignment IV — DSO101 | Royal University of Bhutan*
