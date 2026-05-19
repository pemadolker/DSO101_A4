/**
 * tests/student.test.js
 * Integration test suite for the Student Management API.
 *
 * Uses Jest's module mocking to replace Mongoose with an in-process stub,
 * so tests run in any CI environment without a real MongoDB connection.
 *
 * Coverage targets:
 *  ✅ Health check endpoint
 *  ✅ POST   /api/students  – create (valid + validation errors + duplicate)
 *  ✅ GET    /api/students  – fetch all
 *  ✅ GET    /api/students/:id – fetch one (valid, missing, bad ObjectId)
 *  ✅ PUT    /api/students/:id – update (valid, missing, bad ObjectId, invalid)
 *  ✅ DELETE /api/students/:id – delete (valid, missing, bad ObjectId)
 */

import { jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";

// ── Shared mock student data ─────────────────────────────────────────────────

const MOCK_ID = new mongoose.Types.ObjectId().toString();

const mockStudentData = {
  _id: MOCK_ID,
  name: "Pema Dorji",
  email: "pema.dorji@university.edu",
  department: "Software Engineering",
  semester: 3,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// ── Mock the Student model ────────────────────────────────────────────────────

jest.unstable_mockModule("../src/models/Student.js", () => {
  const StudentMock = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
  };

  StudentMock.find.mockReturnValue({
    sort: jest.fn().mockResolvedValue([])
  });

  return { default: StudentMock };
});

// ── Import app AFTER mocks are registered ────────────────────────────────────
const { default: app } = await import("../src/app.js");
const { default: Student } = await import("../src/models/Student.js");

// ─── Reset mocks between tests ────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  Student.find.mockReturnValue({
    sort: jest.fn().mockResolvedValue([])
  });
});

// ─── Health Check ─────────────────────────────────────────────────────────────

describe("GET /  — Health Check", () => {
  it("returns 200 with the correct message", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Student Management API Running");
  });
});

// ─── Create Student ───────────────────────────────────────────────────────────

describe("POST /api/students  — Create Student", () => {
  const validPayload = {
    name: "Pema Dorji",
    email: "pema.dorji@university.edu",
    department: "Software Engineering",
    semester: 3
  };

  it("creates a student with valid data and returns 201", async () => {
    Student.create.mockResolvedValue(mockStudentData);
    const res = await request(app).post("/api/students").send(validPayload);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(validPayload.name);
    expect(Student.create).toHaveBeenCalledTimes(1);
  });

  it("returns 422 when name is missing", async () => {
    const { name, ...payload } = validPayload;
    const res = await request(app).post("/api/students").send(payload);
    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("returns 422 when name is shorter than 3 characters", async () => {
    const res = await request(app)
      .post("/api/students")
      .send({ ...validPayload, name: "AB" });
    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("returns 422 when email is invalid", async () => {
    const res = await request(app)
      .post("/api/students")
      .send({ ...validPayload, email: "not-an-email" });
    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("returns 422 when department is missing", async () => {
    const { department, ...payload } = validPayload;
    const res = await request(app).post("/api/students").send(payload);
    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("returns 422 when semester exceeds 8", async () => {
    const res = await request(app)
      .post("/api/students")
      .send({ ...validPayload, semester: 9 });
    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("returns 422 when semester is below 1", async () => {
    const res = await request(app)
      .post("/api/students")
      .send({ ...validPayload, semester: 0 });
    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("returns 409 on duplicate email (MongoDB code 11000)", async () => {
    const duplicateError = new Error("Duplicate key");
    duplicateError.code = 11000;
    duplicateError.keyValue = { email: validPayload.email };
    Student.create.mockRejectedValue(duplicateError);
    const res = await request(app).post("/api/students").send(validPayload);
    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

// ─── Get All Students ─────────────────────────────────────────────────────────

describe("GET /api/students  — Fetch All Students", () => {
  it("returns 200 with an empty array when no students exist", async () => {
    const res = await request(app).get("/api/students");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
    expect(res.body.count).toBe(0);
  });

  it("returns all students in the collection", async () => {
    const two = [
      mockStudentData,
      { ...mockStudentData, _id: new mongoose.Types.ObjectId().toString(), email: "other@uni.edu" }
    ];
    Student.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(two) });
    const res = await request(app).get("/api/students");
    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(2);
  });
});

// ─── Get Student By ID ────────────────────────────────────────────────────────

describe("GET /api/students/:id  — Fetch Single Student", () => {
  it("returns 200 with the student for a valid ID", async () => {
    Student.findById.mockResolvedValue(mockStudentData);
    const res = await request(app).get(`/api/students/${MOCK_ID}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(MOCK_ID);
  });

  it("returns 404 when student does not exist", async () => {
    Student.findById.mockResolvedValue(null);
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/students/${fakeId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Student not found");
  });

  it("returns 400 for a malformed ObjectId", async () => {
    const castError = new mongoose.Error.CastError("ObjectId", "bad-id", "_id");
    Student.findById.mockRejectedValue(castError);
    const res = await request(app).get("/api/students/bad-id");
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── Update Student ───────────────────────────────────────────────────────────

describe("PUT /api/students/:id  — Update Student", () => {
  const updatePayload = {
    name: "Pema Dorji",
    email: "pema.dorji@university.edu",
    department: "Computer Science",
    semester: 5
  };

  it("updates the student and returns 200", async () => {
    Student.findByIdAndUpdate.mockResolvedValue({ ...mockStudentData, ...updatePayload });
    const res = await request(app).put(`/api/students/${MOCK_ID}`).send(updatePayload);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.semester).toBe(5);
  });

  it("returns 404 when student does not exist", async () => {
    Student.findByIdAndUpdate.mockResolvedValue(null);
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).put(`/api/students/${fakeId}`).send(updatePayload);
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 for a malformed ObjectId", async () => {
    const castError = new mongoose.Error.CastError("ObjectId", "bad-id", "_id");
    Student.findByIdAndUpdate.mockRejectedValue(castError);
    const res = await request(app).put("/api/students/bad-id").send(updatePayload);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 422 when update payload fails validation", async () => {
    const res = await request(app)
      .put(`/api/students/${MOCK_ID}`)
      .send({ ...updatePayload, semester: 10 });
    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

// ─── Delete Student ───────────────────────────────────────────────────────────

describe("DELETE /api/students/:id  — Delete Student", () => {
  it("deletes the student and returns 200", async () => {
    Student.findByIdAndDelete.mockResolvedValue(mockStudentData);
    const res = await request(app).delete(`/api/students/${MOCK_ID}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Student deleted successfully");
  });

  it("returns 404 when student does not exist", async () => {
    Student.findByIdAndDelete.mockResolvedValue(null);
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/students/${fakeId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 for a malformed ObjectId", async () => {
    const castError = new mongoose.Error.CastError("ObjectId", "bad-id", "_id");
    Student.findByIdAndDelete.mockRejectedValue(castError);
    const res = await request(app).delete("/api/students/bad-id");
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── Unknown routes ───────────────────────────────────────────────────────────

describe("Unknown routes", () => {
  it("returns 404 for an unrecognised route", async () => {
    const res = await request(app).get("/api/nonexistent");
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
