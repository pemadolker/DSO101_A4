# Student Management API

A production-ready RESTful API built with **Node.js**, **Express.js**, and **MongoDB Atlas**, implementing full CI/CD automation through **GitHub Actions** and **Render**.

---

## Project Overview

The Student Management API provides a complete backend service for managing student records in a university system. It exposes five CRUD endpoints, enforces input validation, centralises error handling, and is fully tested with Jest + Supertest. Every push to `main` triggers a CI pipeline that lints, tests, and deploys the application automatically.

---

## Features

- ✅ Full CRUD operations for student records
- ✅ MVC architecture with clean separation of concerns
- ✅ Input validation with `express-validator`
- ✅ Centralised error handling middleware
- ✅ MongoDB Atlas integration via Mongoose
- ✅ Comprehensive test suite (Jest + Supertest + in-memory MongoDB)
- ✅ GitHub Actions CI pipeline with coverage reporting
- ✅ Automatic deployment to Render via `render.yaml`
- ✅ Environment-based configuration with `dotenv`

---

## Architecture

```
Request → Routes → Validation Middleware → Controller → Model (Mongoose) → MongoDB Atlas
                                                   ↓
                                         Error Middleware → JSON Response
```

The project follows the **MVC (Model-View-Controller)** pattern:

| Layer       | Responsibility                                      |
|-------------|-----------------------------------------------------|
| Routes      | Map HTTP verbs + paths to controller functions      |
| Middleware  | Validate input, handle errors centrally             |
| Controllers | Orchestrate business logic and call the model       |
| Models      | Define schema, interact with MongoDB via Mongoose   |
| Config      | Manage database connections and environment setup   |

---

## Technology Stack

| Category     | Technology               |
|--------------|--------------------------|
| Runtime      | Node.js 20               |
| Framework    | Express.js 4             |
| Database     | MongoDB Atlas            |
| ODM          | Mongoose 8               |
| Validation   | express-validator 7      |
| Testing      | Jest 29 + Supertest 7    |
| CI/CD        | GitHub Actions           |
| Deployment   | Render                   |
| Environment  | dotenv 16                |
| Dev server   | nodemon 3                |

---

## Folder Structure

```
student-management-api/
│
├── src/
│   ├── config/
│   │   └── db.js                   # MongoDB Atlas connection
│   │
│   ├── controllers/
│   │   └── studentController.js    # CRUD business logic
│   │
│   ├── middleware/
│   │   ├── errorMiddleware.js      # Centralised error handler
│   │   └── validateStudent.js      # express-validator rules
│   │
│   ├── models/
│   │   └── Student.js              # Mongoose schema + model
│   │
│   ├── routes/
│   │   └── studentRoutes.js        # Route definitions
│   │
│   └── app.js                      # Express app factory
│
├── tests/
│   └── student.test.js             # Full integration test suite
│
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI pipeline
│
├── .env.example                    # Environment variable template
├── .gitignore
├── render.yaml                     # Render deployment config
├── package.json
├── server.js                       # Application entry point
├── jest.config.js
└── README.md
```

---

## Installation

### Prerequisites

- Node.js 20+
- npm 9+
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free-tier cluster

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/student-management-api.git
cd student-management-api

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and add your MONGO_URI
```

---

## Environment Variables

| Variable    | Required | Description                                     |
|-------------|----------|-------------------------------------------------|
| `MONGO_URI` | ✅ Yes   | MongoDB Atlas connection string                 |
| `PORT`      | ❌ No    | HTTP port (default: `3000`)                     |
| `NODE_ENV`  | ❌ No    | `development` / `test` / `production`           |

### Example `.env`

```env
MONGO_URI=mongodb+srv://username:password@cluster0.example.mongodb.net/student_management?retryWrites=true&w=majority
PORT=3000
NODE_ENV=development
```

---

## Local Development

```bash
# Start with auto-reload (nodemon)
npm run dev

# Start in production mode
npm start
```

The API will be available at `http://localhost:3000`.

---

## API Endpoints

| Method | Endpoint              | Description             |
|--------|-----------------------|-------------------------|
| GET    | `/`                   | Health check            |
| POST   | `/api/students`       | Create a new student    |
| GET    | `/api/students`       | Get all students        |
| GET    | `/api/students/:id`   | Get student by ID       |
| PUT    | `/api/students/:id`   | Update a student        |
| DELETE | `/api/students/:id`   | Delete a student        |

---

## Example Requests & Responses

### Health Check

**Request**
```http
GET /
```

**Response**
```json
{
  "message": "Student Management API Running"
}
```

---

### Create Student

**Request**
```http
POST /api/students
Content-Type: application/json

{
  "name": "Pema Dorji",
  "email": "pema.dorji@university.edu",
  "department": "Software Engineering",
  "semester": 3
}
```

**Response** `201 Created`
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "name": "Pema Dorji",
    "email": "pema.dorji@university.edu",
    "department": "Software Engineering",
    "semester": 3,
    "createdAt": "2024-06-04T10:30:00.000Z",
    "updatedAt": "2024-06-04T10:30:00.000Z"
  }
}
```

---

### Get All Students

**Request**
```http
GET /api/students
```

**Response** `200 OK`
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "665f1a2b3c4d5e6f7a8b9c0d",
      "name": "Pema Dorji",
      "email": "pema.dorji@university.edu",
      "department": "Software Engineering",
      "semester": 3,
      "createdAt": "2024-06-04T10:30:00.000Z",
      "updatedAt": "2024-06-04T10:30:00.000Z"
    }
  ]
}
```

---

### Get Student By ID

**Request**
```http
GET /api/students/665f1a2b3c4d5e6f7a8b9c0d
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "name": "Pema Dorji",
    "email": "pema.dorji@university.edu",
    "department": "Software Engineering",
    "semester": 3,
    "createdAt": "2024-06-04T10:30:00.000Z",
    "updatedAt": "2024-06-04T10:30:00.000Z"
  }
}
```

**Response** `404 Not Found`
```json
{
  "success": false,
  "message": "Student not found"
}
```

---

### Update Student

**Request**
```http
PUT /api/students/665f1a2b3c4d5e6f7a8b9c0d
Content-Type: application/json

{
  "name": "Pema Dorji",
  "email": "pema.dorji@university.edu",
  "department": "Computer Science",
  "semester": 4
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Student updated successfully",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "name": "Pema Dorji",
    "email": "pema.dorji@university.edu",
    "department": "Computer Science",
    "semester": 4,
    "createdAt": "2024-06-04T10:30:00.000Z",
    "updatedAt": "2024-06-04T11:00:00.000Z"
  }
}
```

---

### Delete Student

**Request**
```http
DELETE /api/students/665f1a2b3c4d5e6f7a8b9c0d
```

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

---

### Validation Error Response

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

---

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

Tests use **mongodb-memory-server** — no real database connection is required. Each test clears all collections in `afterEach` to ensure full isolation.

### Coverage Targets

| Metric     | Threshold |
|------------|-----------|
| Lines      | ≥ 80%     |
| Functions  | ≥ 80%     |
| Branches   | ≥ 70%     |
| Statements | ≥ 80%     |

---

## CI/CD Workflow

### Pipeline Stages

```
Push / PR to main
       │
       ▼
┌─────────────────────┐
│  1. Checkout repo   │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  2. Setup Node 20   │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  3. npm ci          │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  4. Lint (syntax)   │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  5. Jest + Coverage │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  6. Verify build    │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  7. Deploy to Render│
└─────────────────────┘
```

The workflow is defined in `.github/workflows/ci.yml`. It runs on every push and pull request targeting `main`.

---

## Deployment to Render

### Automatic Deployment

1. Create a free account at [render.com](https://render.com)
2. Click **New → Blueprint** and connect your GitHub repository
3. Render will detect `render.yaml` and configure the service automatically
4. Set the `MONGO_URI` secret in the Render dashboard under **Environment**
5. Every push to `main` that passes CI will trigger an automatic redeploy

### Manual Setup (alternative)

1. **New Web Service** → connect your GitHub repository
2. **Build Command**: `npm ci`
3. **Start Command**: `node server.js`
4. **Environment Variables**: Add `MONGO_URI` and `NODE_ENV=production`
5. **Health Check Path**: `/`

---

## Screenshots

> Add screenshots of:
> - The running API (e.g. Postman or curl output)
> - GitHub Actions workflow passing
> - Render deployment dashboard
> - Coverage report output

---

## Live URL

> `https://student-management-api.onrender.com`
> *(Replace with your actual Render URL after deployment)*

---

## GitHub Repository

> `https://github.com/<your-username>/student-management-api`
> *(Replace with your actual repository URL)*

---

## Licence

MIT
