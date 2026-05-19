/**
 * Student Notes API — Test Suite
 *
 * Uses a SEPARATE test database (TEST_DATABASE_URL) to avoid
 * polluting production data. Tables are wiped before each test run.
 *
 * In CI (GitHub Actions), a real PostgreSQL service container runs.
 * Locally, you need a local Postgres instance or set TEST_DATABASE_URL
 * to a test database on Render.
 */

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

const request = require("supertest");
const app = require("./src/app");
const { pool, initializeDatabase } = require("./src/db");

// ─────────────────────────────────────────────
// SETUP & TEARDOWN
// ─────────────────────────────────────────────

beforeAll(async () => {
  // Initialize schema before tests run
  await initializeDatabase();
});

beforeEach(async () => {
  // Wipe the notes table before each test for a clean slate
  // This ensures tests never depend on each other's data
  await pool.query("DELETE FROM notes");
  await pool.query("ALTER SEQUENCE notes_id_seq RESTART WITH 1");
});

afterAll(async () => {
  // Close DB pool so Jest can exit cleanly
  await pool.end();
});

// ─────────────────────────────────────────────
// HELPER: Create a note directly (for test setup)
// ─────────────────────────────────────────────
const createTestNote = async (overrides = {}) => {
  const defaults = {
    title: "Test Note",
    content: "This is test content",
    subject: "Software Engineering",
  };
  const note = { ...defaults, ...overrides };
  const res = await request(app).post("/api/notes").send(note);
  return res.body.data;
};

// ─────────────────────────────────────────────
// TEST SUITE 1: Root & Health
// ─────────────────────────────────────────────
describe("GET /", () => {
  test("should return API info and available endpoints", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Student Notes API");
    expect(res.body.endpoints).toBeDefined();
  });
});

describe("GET /health", () => {
  test("should return healthy status with database connected", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("healthy");
    expect(res.body.database).toBe("connected");
  });
});

// ─────────────────────────────────────────────
// TEST SUITE 2: GET /api/notes
// ─────────────────────────────────────────────
describe("GET /api/notes", () => {
  test("should return empty array when no notes exist", async () => {
    const res = await request(app).get("/api/notes");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
    expect(res.body.count).toBe(0);
  });

  test("should return all notes", async () => {
    await createTestNote({ title: "Note 1", subject: "Maths" });
    await createTestNote({ title: "Note 2", subject: "Physics" });

    const res = await request(app).get("/api/notes");
    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.data).toHaveLength(2);
  });

  test("should return notes in descending order by created_at", async () => {
    await createTestNote({ title: "First Note" });
    await createTestNote({ title: "Second Note" });

    const res = await request(app).get("/api/notes");
    expect(res.body.data[0].title).toBe("Second Note");
    expect(res.body.data[1].title).toBe("First Note");
  });
});

// ─────────────────────────────────────────────
// TEST SUITE 3: GET /api/notes/:id
// ─────────────────────────────────────────────
describe("GET /api/notes/:id", () => {
  test("should return a single note by ID", async () => {
    const created = await createTestNote({ title: "My DSO Note" });

    const res = await request(app).get(`/api/notes/${created.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("My DSO Note");
  });

  test("should return 404 for a non-existent note", async () => {
    const res = await request(app).get("/api/notes/99999");
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Note not found");
  });
});

// ─────────────────────────────────────────────
// TEST SUITE 4: POST /api/notes
// ─────────────────────────────────────────────
describe("POST /api/notes", () => {
  test("should create a new note with valid data", async () => {
    const payload = {
      title: "CI/CD Pipeline Notes",
      content: "GitHub Actions triggers on push to main...",
      subject: "DevOps",
    };

    const res = await request(app).post("/api/notes").send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("CI/CD Pipeline Notes");
    expect(res.body.data.subject).toBe("DevOps");
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.created_at).toBeDefined();
  });

  test("should return 400 when title is missing", async () => {
    const res = await request(app)
      .post("/api/notes")
      .send({ content: "Some content", subject: "Maths" });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should return 400 when content is missing", async () => {
    const res = await request(app)
      .post("/api/notes")
      .send({ title: "Some title", subject: "Maths" });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should return 400 when subject is missing", async () => {
    const res = await request(app)
      .post("/api/notes")
      .send({ title: "Some title", content: "Some content" });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should return 400 for whitespace-only fields", async () => {
    const res = await request(app)
      .post("/api/notes")
      .send({ title: "   ", content: "   ", subject: "   " });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────
// TEST SUITE 5: PUT /api/notes/:id
// ─────────────────────────────────────────────
describe("PUT /api/notes/:id", () => {
  test("should update an existing note", async () => {
    const created = await createTestNote({ title: "Original Title" });

    const res = await request(app)
      .put(`/api/notes/${created.id}`)
      .send({ title: "Updated Title", content: "Updated content", subject: "Updated Subject" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Updated Title");
  });

  test("should return 404 when updating a non-existent note", async () => {
    const res = await request(app)
      .put("/api/notes/99999")
      .send({ title: "T", content: "C", subject: "S" });
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────
// TEST SUITE 6: DELETE /api/notes/:id
// ─────────────────────────────────────────────
describe("DELETE /api/notes/:id", () => {
  test("should delete an existing note", async () => {
    const created = await createTestNote({ title: "Note to Delete" });

    const res = await request(app).delete(`/api/notes/${created.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Note deleted successfully");
  });

  test("should return 404 when deleting a non-existent note", async () => {
    const res = await request(app).delete("/api/notes/99999");
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("should confirm deleted note no longer exists", async () => {
    const created = await createTestNote();
    await request(app).delete(`/api/notes/${created.id}`);

    const res = await request(app).get(`/api/notes/${created.id}`);
    expect(res.statusCode).toBe(404);
  });
});

// ─────────────────────────────────────────────
// TEST SUITE 7: 404 Route
// ─────────────────────────────────────────────
describe("Unknown routes", () => {
  test("should return 404 for undefined routes", async () => {
    const res = await request(app).get("/api/unknown-route");
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
