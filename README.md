# Student Management API

> A production-ready RESTful API built with **Node.js**, **Express.js**, and **MongoDB Atlas**, featuring a complete **CI/CD pipeline** using **GitHub Actions** and **Render**.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [Folder Structure](#folder-structure)
6. [Installation](#installation)
7. [Environment Variables](#environment-variables)
8. [Local Development](#local-development)
9. [API Endpoints](#api-endpoints)
10. [Example Requests and Responses](#example-requests-and-responses)
11. [Testing Strategy](#testing-strategy)
12. [CI/CD Pipeline](#cicd-pipeline)
13. [Deployment to Render](#deployment-to-render)
14. [Screenshots](#screenshots)
15. [Live URL](#live-url)
16. [GitHub Repository](#github-repository)

---

## Project Overview

The **Student Management API** is a backend web service that exposes a RESTful HTTP interface for creating, reading, updating, and deleting student records. It was built as a **DSO101 (DevOps)** assignment to demonstrate a fully automated software delivery pipeline — from writing code locally, to pushing to GitHub, to a live production deployment with zero manual steps.

The core DevOps principle demonstrated here is **CI/CD**:

- **Continuous Integration** — every `git push` automatically triggers a pipeline that lints the code, runs 22 tests, and verifies the build. If anything fails, the push is flagged and deployment is blocked.
- **Continuous Deployment** — only after every CI check passes does the pipeline automatically deploy to Render. Broken code can never reach production.

This means the entire journey from `git push` to a live, updated API takes approximately 30 seconds with no human involvement.

---

## Features

- ✅ Full CRUD operations for student records (Create, Read, Update, Delete)
- ✅ MVC architecture with clean separation of concerns
- ✅ Input validation using `express-validator` with meaningful field-level error messages
- ✅ Centralised error handling middleware covering all error types
- ✅ MongoDB Atlas cloud database integration via Mongoose ODM
- ✅ 22-test automated suite using Jest and Supertest
- ✅ GitHub Actions CI/CD pipeline — two jobs, CI gates CD
- ✅ Automatic deployment to Render on every successful pipeline run
- ✅ Environment-based configuration using dotenv
- ✅ Health check endpoint for deployment verification

---

## Architecture

```
HTTP Request
     │
     ▼
┌──────────────┐
│    Routes    │  ← Maps URL + HTTP method to the correct controller function
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Validation  │  ← express-validator checks all input before it reaches business logic
│  Middleware  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Controller  │  ← Handles business logic; calls the model; sends the response
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Model     │  ← Mongoose schema; communicates with MongoDB Atlas
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  MongoDB     │  ← Cloud-hosted NoSQL database on Atlas (Cluster0)
│  Atlas       │
└──────────────┘

     (on any error, next(err) flows into:)

┌──────────────┐
│    Error     │  ← Catches CastError, ValidationError, duplicate key, 500s
│  Middleware  │     and formats them all as consistent JSON
└──────────────┘
       │
       ▼
  JSON Response
```

### Why MVC?

MVC separates the application into three distinct responsibilities so each file has exactly one job:

| Layer | Responsibility |
|---|---|
| **Model** | Knows about data shape and the database. Has no knowledge of HTTP. |
| **Controller** | Knows about HTTP requests and responses. Delegates all data work to the model. |
| **View** | In a REST API there is no HTML — the JSON response is the view. |

This separation means when something breaks, you know exactly which layer to look in.

---

## Technology Stack

| Category | Technology | Purpose |
|---|---|---|
| Runtime | Node.js 20 | Executes JavaScript on the server |
| Framework | Express.js 4 | HTTP routing, middleware pipeline |
| Database | MongoDB Atlas | Cloud-hosted NoSQL database |
| ODM | Mongoose 8 | Schema definition and MongoDB queries |
| Validation | express-validator 7 | Validates and sanitises request body fields |
| Testing | Jest 29 | Test runner, assertions, mocking, coverage |
| Testing | Supertest 7 | Makes real HTTP requests to Express in tests |
| CI/CD | GitHub Actions | Automates lint, test, and deploy on every push |
| Deployment | Render | Cloud platform hosting the live API |
| Config | dotenv 16 | Loads secrets from `.env` into `process.env` |
| Dev Tool | nodemon 3 | Auto-restarts server when source files change |

---

## Folder Structure

```
student-management-api/
│
├── src/                              # All application source code
│   ├── config/
│   │   └── db.js                     # MongoDB Atlas connection — reads MONGO_URI from env
│   │
│   ├── controllers/
│   │   └── studentController.js      # CRUD business logic for all 5 endpoints
│   │
│   ├── middleware/
│   │   ├── errorMiddleware.js        # Centralised error handler (4-param Express signature)
│   │   └── validateStudent.js        # express-validator rules + error response handler
│   │
│   ├── models/
│   │   └── Student.js                # Mongoose schema: name, email, department, semester
│   │
│   ├── routes/
│   │   └── studentRoutes.js          # Maps HTTP verbs + paths to controllers
│   │
│   └── app.js                        # Express app factory — imported by tests without server
│
├── tests/
│   └── student.test.js               # 22 tests covering all endpoints and error cases
│
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions — CI job then CD job
│
├── .env.example                      # Template listing all required environment variables
├── .env                              # Local secrets — never committed (in .gitignore)
├── .gitignore                        # Excludes node_modules, .env, coverage/
├── render.yaml                       # Render deployment config — build + start + env vars
├── package.json                      # Scripts, dependencies, project metadata
├── jest.config.js                    # Jest config — coverage thresholds, test patterns
├── server.js                         # Entry point — connects DB then starts HTTP server
└── README.md                         # This file
```

---

## Installation

### Prerequisites

- Node.js 20 or higher
- npm 9 or higher
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account with a cluster

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/pemadolker/DSO101_A4.git
cd DSO101_A4

# 2. Install all dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Open .env and paste your MongoDB Atlas connection string
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ Yes | Full MongoDB Atlas connection string |
| `PORT` | ❌ No | HTTP port — defaults to `3000` |
| `NODE_ENV` | ❌ No | `development` / `test` / `production` |

### Example `.env`

```env
MONGO_URI=mongodb+srv://username:password@cluster0.phgjuem.mongodb.net/student_management?retryWrites=true&w=majority&appName=Cluster0
PORT=3000
NODE_ENV=development
```

> **Security:** The `.env` file is listed in `.gitignore` and must never be committed to GitHub. Your actual secrets exist only on your local machine and in the Render dashboard.

---

## Local Development

```bash
# Start with auto-reload on every file save (uses nodemon)
npm run dev

# Start in production mode (no auto-reload)
npm start
```

When running correctly you will see:

```
✅ MongoDB Connected: ac-ffgsphe-shard-00-00.phgjuem.mongodb.net
🚀 Server running on port 3000
📡 Environment: development
```

---

## API Endpoints

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| GET | `/` | Health check | 200 |
| POST | `/api/students` | Create a student | 201, 409, 422 |
| GET | `/api/students` | Get all students | 200 |
| GET | `/api/students/:id` | Get student by ID | 200, 400, 404 |
| PUT | `/api/students/:id` | Update a student | 200, 400, 404, 422 |
| DELETE | `/api/students/:id` | Delete a student | 200, 400, 404 |

### Student Object Fields

| Field | Type | Validation Rules |
|---|---|---|
| `name` | String | Required, minimum 3 characters |
| `email` | String | Required, valid email format, unique per student |
| `department` | String | Required |
| `semester` | Number | Required, integer between 1 and 8 |
| `_id` | ObjectId | Auto-generated by MongoDB |
| `createdAt` | Date | Auto-set by Mongoose timestamps |
| `updatedAt` | Date | Auto-updated by Mongoose timestamps |

---

## Example Requests and Responses

### Health Check

```bash
curl http://localhost:3000/
```

```json
{ "message": "Student Management API Running" }
```

---

### Create a Student — `POST /api/students`

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Pema Dolker","email":"pema@cst.edu","department":"Software Engineering","semester":3}'
```

**201 Created**
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "_id": "6a133be801fe4bd6822c85bc",
    "name": "Pema Dolker",
    "email": "pema@cst.edu",
    "department": "Software Engineering",
    "semester": 3,
    "createdAt": "2026-05-24T17:56:56.246Z",
    "updatedAt": "2026-05-24T17:56:56.246Z"
  }
}
```

**422 Validation Error**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please provide a valid email address" },
    { "field": "semester", "message": "Semester must be an integer between 1 and 8" }
  ]
}
```

**409 Duplicate Email**
```json
{
  "success": false,
  "message": "A student with that email already exists"
}
```

---

### Get All Students — `GET /api/students`

```bash
curl http://localhost:3000/api/students
```

**200 OK**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "6a133be801fe4bd6822c85bc",
      "name": "Pema Dolker",
      "email": "pema@cst.edu",
      "department": "Software Engineering",
      "semester": 3,
      "createdAt": "2026-05-24T17:56:56.246Z",
      "updatedAt": "2026-05-24T17:56:56.246Z"
    },
    {
      "_id": "6a0cc113ea0acba6fd1c3956",
      "name": "Pema Dorji",
      "email": "pema@uni.edu",
      "department": "Software Engineering",
      "semester": 3,
      "createdAt": "2026-05-19T19:59:15.081Z",
      "updatedAt": "2026-05-19T19:59:15.081Z"
    }
  ]
}
```

---

### Get Student by ID — `GET /api/students/:id`

```bash
curl http://localhost:3000/api/students/6a133be801fe4bd6822c85bc
```

**404 Not Found**
```json
{ "success": false, "message": "Student not found" }
```

**400 Invalid ID**
```json
{ "success": false, "message": "Invalid ID format: bad-id" }
```

---

### Update a Student — `PUT /api/students/:id`

```bash
curl -X PUT http://localhost:3000/api/students/6a133be801fe4bd6822c85bc \
  -H "Content-Type: application/json" \
  -d '{"name":"Pema Dolker","email":"pema@cst.edu","department":"Computer Science","semester":4}'
```

**200 OK**
```json
{
  "success": true,
  "message": "Student updated successfully",
  "data": { "semester": 4, "department": "Computer Science" }
}
```

---

### Delete a Student — `DELETE /api/students/:id`

```bash
curl -X DELETE http://localhost:3000/api/students/6a133be801fe4bd6822c85bc
```

**200 OK**
```json
{ "success": true, "message": "Student deleted successfully" }
```

---

## Testing Strategy

### Overview

The test suite lives in `tests/student.test.js` and contains **22 tests** covering every endpoint, every success path, every validation rule, and every error condition. Tests run automatically inside the CI pipeline on every push — no manual triggering required.

### Tools Used

**Jest** is the test runner. It discovers test files, executes them, reports pass/fail with timing, and measures **code coverage** — what percentage of the source code is actually executed during tests.

**Supertest** makes real HTTP requests directly to the Express `app` object without binding to a network port. This means tests are fast, self-contained, and produce real HTTP responses exactly as a client would receive them.

**Jest Module Mocking** (`jest.unstable_mockModule`) replaces the real Mongoose `Student` model with a controlled in-memory fake during tests. This means:
- Tests never touch a real database — they run in milliseconds
- Each test controls exactly what the "database" returns
- Tests are 100% deterministic — same inputs always produce the same result
- Tests pass in CI with no `MONGO_URI` configured

### Why separate `app.js` from `server.js`?

`server.js` connects to MongoDB and binds to a port — you cannot import it in tests without those side effects. `app.js` purely creates and configures the Express application and exports it. Tests import `app.js` directly, so they get a real Express app with all routes and middleware, but without any port binding or database connection.

### Test Organisation — 22 Tests Across 7 Suites

| Suite | Tests | What is covered |
|---|---|---|
| `GET /` Health Check | 1 | API is reachable and returns correct message |
| `POST /api/students` Create | 8 | Happy path, missing name, short name, bad email, missing department, semester > 8, semester < 1, duplicate email |
| `GET /api/students` Fetch All | 2 | Empty collection returns `[]`, populated collection returns all records |
| `GET /api/students/:id` Fetch One | 3 | Valid ID found, valid ID not found (404), malformed ID (400) |
| `PUT /api/students/:id` Update | 4 | Successful update, not found (404), malformed ID (400), invalid data (422) |
| `DELETE /api/students/:id` Delete | 3 | Successful delete, not found (404), malformed ID (400) |
| Unknown Routes | 1 | Any unrecognised URL returns 404 |

### What Each Error Test Proves

- **422 Unprocessable Entity** — the validation middleware runs before the controller. Invalid input never reaches the database layer.
- **404 Not Found** — the controller correctly handles `null` from `findById` / `findByIdAndDelete` / `findByIdAndUpdate`.
- **400 Bad Request** — Mongoose `CastError` (thrown when an ID like `"bad-id"` cannot be cast to ObjectId) is caught by the centralised error middleware and returned as 400, not a 500 crash.
- **409 Conflict** — MongoDB duplicate key error (code `11000`) is caught by the error middleware and returned as a human-readable 409.

### Coverage Results

```
File                     | Statements | Branches | Functions | Lines
-------------------------|------------|----------|-----------|------
app.js                   |    100%    |   100%   |   100%    |  100%
studentController.js     |     97%    |   100%   |   100%    |   97%
errorMiddleware.js       |     67%    |    40%   |    50%    |   73%
validateStudent.js       |    100%    |   100%   |   100%    |  100%
studentRoutes.js         |    100%    |   100%   |   100%    |  100%
-------------------------|------------|----------|-----------|------
Overall                  |     90%    |    67%   |    91%    |   91%
```

> The lower branch coverage in `errorMiddleware.js` is expected — some branches (e.g. Mongoose `ValidationError`) are only reachable with a live database connection, which tests intentionally avoid by design.

### Running Tests

```bash
# Run all 22 tests
npm test

# Run with full coverage report in terminal
npm run test:coverage
```

---

## CI/CD Pipeline

### What is CI/CD?

**Continuous Integration (CI)** means every code change is automatically tested the moment it is pushed to GitHub. No developer manually runs tests — the pipeline does it, and the result is visible to the whole team within seconds.

**Continuous Deployment (CD)** means if all CI checks pass, the code is automatically deployed to the live server. No SSH, no manual deploy commands — it happens automatically and only after the code is proven to work.

Together they form an automated loop:

```
Write code → git push → CI runs tests → CD deploys → Live API updated
```

The entire loop completes in approximately **30 seconds**.

### Pipeline Definition: `.github/workflows/ci.yml`

The pipeline triggers on every push and pull request to `main`:

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

### Two-Job Structure

The pipeline is split into two separate jobs to enforce the correct order:

```
┌─────────────────────────────────┐
│   JOB 1: Continuous Integration │   Runs on every push AND pull request
│                                 │
│  Stage 1 — Checkout repository  │   Clones code onto the fresh runner VM
│  Stage 2 — Set up Node.js 20    │   Installs correct runtime, enables cache
│  Stage 3 — Install dependencies │   npm ci — exact lockfile install
│  Stage 4 — Lint syntax check    │   node --check on every source file
│  Stage 5 — Run tests + coverage │   22 Jest tests, 80%+ coverage enforced
│  Stage 6 — Verify build         │   Imports app.js to confirm no crash
└──────────────┬──────────────────┘
               │  needs: CI (CD waits for CI to pass)
               │  if: push to main only (PRs don't deploy)
               ▼
┌─────────────────────────────────┐
│  JOB 2: Continuous Deployment   │   Runs ONLY after CI passes, ONLY on push
│                                 │
│  Stage 7 — Deploy to Render     │   HTTP POST to Render deploy hook URL
│                                 │   Render pulls latest code → npm ci →
│                                 │   node server.js → health check → Live
└─────────────────────────────────┘
```

### Why Each Stage Exists

| Stage | Reason |
|---|---|
| Checkout | The runner is a blank VM — it has no code until this step |
| Setup Node.js | Pins the Node version so CI and production are identical |
| `npm ci` | Uses the lockfile for exact reproducible installs — prevents silent version drift |
| Lint | Catches syntax errors in seconds before spending time on the full test run |
| Tests + Coverage | The most important gate — untested code cannot be trusted |
| Verify build | Confirms the app can start; tests can pass while startup still crashes |
| Deploy to Render | Only reachable if every previous stage succeeded — broken code is impossible to deploy |

### The CD Gate

The CD job has two conditions that must both be true before it runs:

```yaml
needs: continuous-integration        # CI must have passed
if: github.ref == 'refs/heads/main'  # must be a push to main, not a PR
  && github.event_name == 'push'
```

This means:
- Pull requests run CI only — code is reviewed before it can trigger deployment
- Direct pushes to `main` run CI then CD automatically
- If any test fails, deployment never happens

### Render Deploy Hook

The CD stage calls Render's deploy hook URL via `curl`:

```bash
curl --fail -X POST "${{ secrets.RENDER_DEPLOY_HOOK }}"
```

The URL is stored as a **GitHub Secret** (`RENDER_DEPLOY_HOOK`) so it never appears in code or logs. Render receives the signal, pulls the latest commit, runs `npm ci`, starts `node server.js`, and hits `GET /` to confirm the deployment succeeded. If the health check fails, Render rolls back automatically.

---

## Deployment to Render

### Configuration File: `render.yaml`

The `render.yaml` file at the project root tells Render how to build and run the service:

```yaml
services:
  - type: web
    name: student-management-api
    runtime: node
    branch: main
    buildCommand: npm ci
    startCommand: node server.js
    healthCheckPath: /
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGO_URI
        sync: false   # Set securely in Render dashboard
```

### Environment Variables on Render

| Key | Value |
|---|---|
| `MONGO_URI` | Full MongoDB Atlas connection string |
| `NODE_ENV` | `production` |

### Deployment Flow

Every `git push` to `main` that passes CI triggers this sequence on Render:

1. Render receives the deploy hook signal from GitHub Actions
2. Clones the latest commit from `github.com/pemadolker/DSO101_A4`
3. Runs `npm ci` to install dependencies
4. Starts the server with `node server.js`
5. Polls `GET /` — if it returns 200, deployment is marked **Live**
6. If health check fails, Render rolls back to the previous working deployment

> **Note on free tier:** Render's free tier spins down the service after 15 minutes of inactivity. The first request after a period of inactivity may take 30–50 seconds while the service wakes up. This is expected behaviour on the free plan.

---

## Screenshots

### 1. Local Development Server Running

API connected to MongoDB Atlas and running on port 3000.

![Local Dev Server](screenshots/dev.png)

---

### 2. curl Requests — API Working Locally

Health check, create student, and get all students tested via curl.

![curl Requests](screenshots/curl.png)

---

### 3. MongoDB Atlas — Student Records in Database

Real student documents stored in the `student_management.students` collection on Atlas.

![MongoDB Atlas Collections](screenshots/students.png)

---

### 4. Jest Test Results — 22 Tests Passing

All 22 tests pass with 90% statement coverage and 91% line coverage.

![Jest Test Results](screenshots/tests.png)

---

### 5. GitHub Actions — All Workflow Runs

History of pipeline runs triggered by each push to `main`.

![GitHub Actions Runs](screenshots/cionpush.png)

---

### 6. CI Job — All Stages Passing

Continuous Integration job showing all 6 stages completing successfully in 12 seconds.

![CI Job Stages](screenshots/ci.png)

---

### 7. CD Job — Deployment Triggered

Continuous Deployment job confirming deploy hook returned HTTP 200 and Render started building.

![CD Job](screenshots/cd.png)

---

### 8. Full Pipeline Summary

Both CI and CD jobs shown in sequence — CI (12s) gates CD (3s), total pipeline 21 seconds.

![Full Pipeline](screenshots/pipeline.png)

---

### 9. Render — Auto Deploy on Push

Render dashboard showing the deployment was triggered by the `cd stage` commit from GitHub Actions.

![Render Auto Deploy](screenshots/deployonpush.png)

---

### 10. Live API in Browser

The deployed API responding at `https://dso101-a4-s6u4.onrender.com`.

![Live URL](screenshots/liveurl.png)

---

## Live URL

**`https://dso101-a4-s6u4.onrender.com`**

Test the live API:
```bash
curl https://dso101-a4-s6u4.onrender.com/
curl https://dso101-a4-s6u4.onrender.com/api/students
```

> First request may take up to 50 seconds if the free-tier instance has spun down.

---

## GitHub Repository

**`https://github.com/pemadolker/DSO101_A4`**

---

