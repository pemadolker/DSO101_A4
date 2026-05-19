/**
 * middleware/validateStudent.js
 * express-validator rules for the Student resource.
 * Applied as route-level middleware before controllers execute.
 */

import { body, validationResult } from "express-validator";

/**
 * Validation rule chain for creating or updating a student.
 * All fields are validated and sanitised before reaching the controller.
 */
export const studentValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("department")
    .trim()
    .notEmpty()
    .withMessage("Department is required"),

  body("semester")
    .notEmpty()
    .withMessage("Semester is required")
    .isInt({ min: 1, max: 8 })
    .withMessage("Semester must be an integer between 1 and 8")
];

/**
 * Middleware that checks for validation errors produced by the rule chain.
 * If errors exist it short-circuits the request and returns a 422 response.
 *
 * @param {import("express").Request}  req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg }))
    });
  }

  next();
};
