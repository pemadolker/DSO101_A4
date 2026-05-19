const { Pool } = require("pg");

// Pool = a collection of reusable DB connections
// Instead of opening/closing a connection per request (slow),
// a Pool keeps several connections alive and reuses them
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Required for Render PostgreSQL — it uses SSL in production
  // In test/local environments we skip SSL
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Test the connection when the app starts
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Failed to connect to database:", err.message);
  } else {
    console.log("✅ Connected to PostgreSQL database");
    release(); // Release the client back to the pool
  }
});

// Helper: initialize tables if they don't exist yet
// This runs once on startup — safe to call every time (IF NOT EXISTS)
const initializeDatabase = async () => {
  const createNotesTable = `
    CREATE TABLE IF NOT EXISTS notes (
      id        SERIAL PRIMARY KEY,
      title     VARCHAR(255) NOT NULL,
      content   TEXT NOT NULL,
      subject   VARCHAR(100) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  await pool.query(createNotesTable);
  console.log("✅ Database tables ready");
};

module.exports = { pool, initializeDatabase };
