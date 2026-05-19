require("dotenv").config(); // Load .env variables before anything else

const app = require("./src/app");
const { initializeDatabase } = require("./src/db");

const PORT = process.env.PORT || 3000;

// Initialize DB tables, then start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => {
    console.error(" Failed to initialize database:", err.message);
    process.exit(1); // Exit with error code — tells Render something went wrong
  });
