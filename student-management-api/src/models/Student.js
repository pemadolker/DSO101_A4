/**
 * models/Student.js
 * Mongoose schema and model for the Student resource.
 */

import mongoose from "mongoose";

/**
 * @typedef {Object} Student
 * @property {string} name        - Full name of the student (min 3 chars)
 * @property {string} email       - Unique email address
 * @property {string} department  - Academic department
 * @property {number} semester    - Current semester (1–8)
 * @property {Date}   createdAt   - Automatically set by Mongoose timestamps
 * @property {Date}   updatedAt   - Automatically updated by Mongoose timestamps
 */
const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"]
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: [1, "Semester must be between 1 and 8"],
      max: [8, "Semester must be between 1 and 8"],
      validate: {
        validator: Number.isInteger,
        message: "Semester must be an integer"
      }
    }
  },
  {
    // Automatically manage createdAt and updatedAt fields
    timestamps: true
  }
);

const Student = mongoose.model("Student", studentSchema);

export default Student;
