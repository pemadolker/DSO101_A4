/**
 * routes/studentRoutes.js
 * Defines all routes for the /api/students resource.
 * Validation middleware runs before each controller function.
 */

import { Router } from "express";
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} from "../controllers/studentController.js";
import {
  studentValidationRules,
  handleValidationErrors
} from "../middleware/validateStudent.js";

const router = Router();

// Compose validation pipeline once and reuse
const validate = [...studentValidationRules, handleValidationErrors];

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST   /api/students        → Create a new student
router.post("/", validate, createStudent);

// GET    /api/students        → Retrieve all students
router.get("/", getAllStudents);

// GET    /api/students/:id    → Retrieve a single student
router.get("/:id", getStudentById);

// PUT    /api/students/:id    → Update a student
router.put("/:id", validate, updateStudent);

// DELETE /api/students/:id    → Delete a student
router.delete("/:id", deleteStudent);

export default router;
