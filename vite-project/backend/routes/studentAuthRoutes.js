
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Student from "../models/Student.js";

const router = express.Router();

// Check whether a student has a valid login token
const requireStudent = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Please log in as a student first.",
    });
  }

  try {
    const token = authorization.slice(7);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "student" || !decoded.studentId) {
      throw new Error("Invalid student token.");
    }

    req.studentId = decoded.studentId;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Student session expired. Please log in again.",
    });
  }
};

// Student Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured.",
      });
    }

    // Find student by generated username
    const student = await Student.findOne({
      username: username.trim().toLowerCase(),
    }).select("+passwordHash");

    // Verify the entered password
    if (
      !student ||
      !student.passwordHash ||
      !(await bcrypt.compare(password, student.passwordHash))
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid student username or password.",
      });
    }

    // Generate a student-specific login token
    const token = jwt.sign(
      {
        studentId: String(student._id),
        role: "student",
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      success: true,
      message: "Student login successful.",
      token,
      student: {
        id: String(student._id),
        name: student.name,
        username: student.username,
        className: student.className,
        section: student.section,
        rollNo: student.rollNo,
        email: student.email,
        mustChangePassword: student.mustChangePassword,
      },
    });
  } catch (error) {
    console.error("Student login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to log in. Please try again.",
    });
  }
});

// Verify the saved student session after refreshing the page
router.get("/me", requireStudent, async (req, res) => {
  try {
    const student = await Student.findById(req.studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student account not found.",
      });
    }

    return res.json({
      success: true,
      student: {
        id: String(student._id),
        name: student.name,
        username: student.username,
        className: student.className,
        section: student.section,
        rollNo: student.rollNo,
        email: student.email,
        mustChangePassword: student.mustChangePassword,
      },
    });
  } catch (error) {
    console.error("Student session error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify student session.",
    });
  }
});

export default router;
