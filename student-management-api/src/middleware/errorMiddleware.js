/**
 * middleware/errorMiddleware.js
 * Centralised Express error-handling middleware.
 * Must be registered AFTER all routes (four-argument signature).
 */

import mongoose from "mongoose";

/**
 * Global error handler.
 * Normalises different error types into a consistent JSON structure:
 *
 *   { success: false, message: "..." }
 *
 * Handled error types:
 *  - Mongoose CastError  → 400 (invalid ObjectId format)
 *  - Mongoose ValidationError → 422
 *  - MongoDB duplicate key (code 11000) → 409
 *  - Everything else → 500
 *
 * @param {Error}  err
 * @param {import("express").Request}  _req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */
const errorMiddleware = (err, _req, res, _next) => {
  console.error("Error:", err.message);

  // Invalid MongoDB ObjectId  (e.g. /api/students/not-an-id)
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format: ${err.value}`
    });
  }

  // Mongoose schema-level validation failure
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(422).json({
      success: false,
      message: messages.join(", ")
    });
  }

  // MongoDB duplicate key error (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `A student with that ${field} already exists`
    });
  }

  // Fallback: internal server error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};

export default errorMiddleware;
