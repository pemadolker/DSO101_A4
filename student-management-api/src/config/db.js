/**
 * config/db.js
 * MongoDB Atlas connection utility.
 * Reads the connection string from MONGO_URI environment variable.
 */

import mongoose from "mongoose";

/**
 * Establishes a connection to MongoDB Atlas.
 * Logs a success message on connection or throws on failure.
 *
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(uri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    throw error; // Let the caller (server.js) handle process exit
  }
};

export default connectDB;
