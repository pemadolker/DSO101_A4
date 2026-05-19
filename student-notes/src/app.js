const express = require("express");
const app = express();

app.use(express.json()); // Parse incoming JSON request bodies

// ── Routes ────────────────────────────────────
const notesRouter = require("./routes/notes");
app.use("/api/notes", notesRouter);

// ── Health Check ──────────────────────────────
// Checks both server AND database connectivity
app.get("/health", async (req, res) => {
  try {
    const { pool } = require("./db");
    await pool.query("SELECT 1"); // Lightweight DB ping
    res.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Server is up but DB is down — still a problem
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
      error: err.message,
    });
  }
});

// ── Root ──────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "Student Notes API",
    version: "1.0.0",
    endpoints: {
      health: "GET /health",
      notes: {
        getAll: "GET /api/notes",
        getOne: "GET /api/notes/:id",
        create: "POST /api/notes",
        update: "PUT /api/notes/:id",
        delete: "DELETE /api/notes/:id",
      },
    },
  });
});

// ── 404 Handler ───────────────────────────────
// Catches any route that doesn't match above
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

module.exports = app;
