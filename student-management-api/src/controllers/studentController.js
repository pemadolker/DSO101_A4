/**
 * controllers/studentController.js
 * Handles all business logic for the Student resource.
 * Each function is an async Express route handler that delegates
 * errors to the centralised error middleware via next(err).
 */

import Student from "../models/Student.js";

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * POST /api/students
 * Creates a new student record.
 *
 * @param {import("express").Request}  req - Body: { name, email, department, semester }
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const createStudent = async (req, res, next) => {
  try {
    const { name, email, department, semester } = req.body;

    const student = await Student.create({ name, email, department, semester });

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student
    });
  } catch (err) {
    next(err);
  }
};

// ─── Read All ─────────────────────────────────────────────────────────────────

/**
 * GET /api/students
 * Returns all student records sorted by creation date (newest first).
 *
 * @param {import("express").Request}  _req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const getAllStudents = async (_req, res, next) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (err) {
    next(err);
  }
};

// ─── Read One ─────────────────────────────────────────────────────────────────

/**
 * GET /api/students/:id
 * Returns a single student by their MongoDB ObjectId.
 *
 * @param {import("express").Request}  req - Params: id
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (err) {
    next(err);
  }
};

// ─── Update ───────────────────────────────────────────────────────────────────

/**
 * PUT /api/students/:id
 * Updates an existing student record.
 * Uses runValidators to enforce schema-level validation on updates.
 *
 * @param {import("express").Request}  req - Params: id | Body: partial student fields
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const updateStudent = async (req, res, next) => {
  try {
    const { name, email, department, semester } = req.body;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, email, department, semester },
      {
        new: true,           // Return the updated document
        runValidators: true  // Enforce schema validators on update
      }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student
    });
  } catch (err) {
    next(err);
  }
};

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * DELETE /api/students/:id
 * Permanently removes a student record.
 *
 * @param {import("express").Request}  req - Params: id
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully"
    });
  } catch (err) {
    next(err);
  }
};
