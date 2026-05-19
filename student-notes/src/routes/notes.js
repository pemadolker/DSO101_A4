const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// ─────────────────────────────────────────────
// GET /api/notes
// Fetch all notes, newest first
// ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM notes ORDER BY created_at DESC"
    );
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error("Error fetching notes:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch notes" });
  }
});

// ─────────────────────────────────────────────
// GET /api/notes/:id
// Fetch a single note by ID
// ─────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM notes WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error fetching note:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch note" });
  }
});

// ─────────────────────────────────────────────
// POST /api/notes
// Create a new note
// ─────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { title, content, subject } = req.body;

    // Validate required fields
    if (!title || !content || !subject) {
      return res.status(400).json({
        success: false,
        error: "All fields are required: title, content, subject",
      });
    }

    // Trim whitespace and check for empty strings
    if (!title.trim() || !content.trim() || !subject.trim()) {
      return res.status(400).json({
        success: false,
        error: "Fields cannot be empty or whitespace only",
      });
    }

    const result = await pool.query(
      `INSERT INTO notes (title, content, subject)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title.trim(), content.trim(), subject.trim()]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error creating note:", err.message);
    res.status(500).json({ success: false, error: "Failed to create note" });
  }
});

// ─────────────────────────────────────────────
// PUT /api/notes/:id
// Update an existing note
// ─────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, subject } = req.body;

    if (!title || !content || !subject) {
      return res.status(400).json({
        success: false,
        error: "All fields are required: title, content, subject",
      });
    }

    const result = await pool.query(
      `UPDATE notes
       SET title = $1, content = $2, subject = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [title.trim(), content.trim(), subject.trim(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error updating note:", err.message);
    res.status(500).json({ success: false, error: "Failed to update note" });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/notes/:id
// Delete a note by ID
// ─────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM notes WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }

    res.json({
      success: true,
      message: "Note deleted successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error deleting note:", err.message);
    res.status(500).json({ success: false, error: "Failed to delete note" });
  }
});

module.exports = router;
