/**
 * app.js
 * Express application factory.
 * Wires together middleware, routes and error handlers.
 * Exported separately from server.js so tests can import without
 * starting a live server or requiring a real DB connection.
 */

import express from "express";
import studentRoutes from "./routes/studentRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────

// Parse incoming JSON bodies
app.use(express.json());

// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────

/**
 * GET /
 * Returns a simple status message to confirm the API is reachable.
 */
app.get("/", (_req, res) => {
  res.status(200).json({ message: "Student Management API Running" });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use("/api/students", studentRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Centralised Error Middleware ─────────────────────────────────────────────

app.use(errorMiddleware);

export default app;
