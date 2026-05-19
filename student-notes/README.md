# 📝 Student Notes API

A RESTful API for managing student notes, built with **Node.js + Express** and **PostgreSQL**. Features a fully automated CI/CD pipeline using **GitHub Actions** and **Render**.

---

## 🔗 Live App

> [Your Render URL here after deployment]

---

## 📌 Overview

This project demonstrates a production-grade CI/CD pipeline where every push to `main`:

1. Spins up a PostgreSQL test database inside GitHub Actions
2. Installs dependencies and runs the full test suite (20+ tests)
3. Only if all tests pass → triggers automatic deployment to Render

```
git push → GitHub Actions
               ├── PostgreSQL service container starts
               ├── npm install
               ├── npm test (20+ tests against real DB)
               └── All pass? → Deploy to Render ✅
                   Any fail? → Pipeline stops ❌ (no broken deploys)
```

---

## 📂 Project Structure

```
student-notes-api/
├── src/
│   ├── app.js              # Express app — routes, middleware
│   ├── db.js               # PostgreSQL connection pool + schema init
│   └── routes/
│       └── notes.js        # CRUD route handlers
├── server.js               # Entry point — starts server
├── app.test.js             # Jest + Supertest test suite (20+ tests)
├── package.json
├── .env.example            # Environment variable template
├── .gitignore
├── README.md
└── .github/
    └── workflows/
        └── ci.yml          # GitHub Actions pipeline
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18 |
| Framework | Express.js |
| Database | PostgreSQL (Render managed) |
| ORM/Driver | node-postgres (`pg`) |
| Testing | Jest + Supertest |
| CI/CD | GitHub Actions |
| Deployment | Render Web Service |

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info and endpoint listing |
| GET | `/health` | Health check (server + DB status) |
| GET | `/api/notes` | Get all notes (newest first) |
| GET | `/api/notes/:id` | Get a single note |
| POST | `/api/notes` | Create a new note |
| PUT | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |

### POST/PUT Request Body

```json
{
  "title": "CI/CD Pipeline Notes",
  "content": "GitHub Actions triggers on push to main branch...",
  "subject": "DevOps"
}
```

### Response Format

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "CI/CD Pipeline Notes",
    "content": "GitHub Actions triggers on push to main branch...",
    "subject": "DevOps",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 🚀 Local Setup

```bash
# Clone repo
git clone https://github.com/YOUR_USERNAME/student-notes-api.git
cd student-notes-api

# Install dependencies
npm install

# Copy environment template and fill in your values
cp .env.example .env

# Start development server
npm run dev
```

---

## 🧪 Running Tests

```bash
npm test
```

Tests use a separate database (`TEST_DATABASE_URL`). Each test suite wipes and reseeds data for full isolation.

---

## ⚙️ Deployment Setup (Render + GitHub)

### 1. Create PostgreSQL Database on Render
- Render Dashboard → New → **PostgreSQL**
- Free tier → create it
- Copy the **Internal Database URL**

### 2. Create Web Service on Render
- New → **Web Service** → connect your GitHub repo
- Build Command: `npm install`
- Start Command: `node server.js`
- Add environment variable: `DATABASE_URL` = (paste Internal DB URL)
- Add environment variable: `NODE_ENV` = `production`
- Deploy → copy the **Deploy Hook URL** from Settings

### 3. Add GitHub Secrets
- Repo → Settings → Secrets and variables → Actions
- Add secret: `RENDER_DEPLOY_HOOK_URL` = (paste Deploy Hook URL)

### 4. Push and Watch the Pipeline
```bash
git push origin main
# Go to GitHub → Actions tab → watch it run live
```

---

*Assignment IV — DSO101 Continuous Integration and Continuous Deployment*  
*Bachelor of Engineering in Software Engineering — Royal University of Bhutan*
