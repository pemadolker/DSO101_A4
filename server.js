/**
 * server.js
 * Application entry point — starts the HTTP server.
 * Kept deliberately thin so that app.js can be imported in tests
 * without binding to a port.
 */

import "dotenv/config";
import app from "./student-management-api/src/app.js";
import connectDB from "./student-management-api/src/config/db.js";

const PORT = process.env.PORT || 3000;

// Connect to MongoDB Atlas, then start listening
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err.message);
    process.exit(1);
  });
