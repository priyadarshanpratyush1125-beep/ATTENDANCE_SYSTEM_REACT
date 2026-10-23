
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";

import Student from "./models/Student.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Allow requests from the local React frontend
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// Read JSON sent by the frontend
app.use(express.json());

// Basic server test
app.get("/", (req, res) => {
  res.send("Student Attendance backend is running!");
});

// Check the backend and database connection
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend API is working",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

// GET: Retrieve students from MongoDB
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Error retrieving students:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve students.",
    });
  }
});

// POST: Save a new student in MongoDB
app.post("/api/students", async (req, res) => {
  try {
    const {
      name,
      className,
      section,
      rollNo,
      email,
      phone,
    } = req.body;

    const student = await Student.create({
      name,
      className,
      section,
      rollNo,
      email,
      phone,
    });

    res.status(201).json({
      success: true,
      message: "Student record saved successfully.",
      student,
    });
  } catch (error) {
    // Duplicate roll number or email
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This roll number or email already exists.",
      });
    }

    // Invalid student data
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Error saving student:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to save student.",
    });
  }
});

// Connect to MongoDB before starting Express

 // DELETE: Remove a student from MongoDB
 app.delete("/api/students/:id", async (req, res) => {
   try {
     const { id } = req.params;

     // Check whether the supplied ID is valid
     if (!mongoose.isValidObjectId(id)) {
       return res.status(400).json({
         success: false,
         message: "Invalid student ID.",
       });
     }

     // Find the student and permanently delete the document
     const deletedStudent = await Student.findByIdAndDelete(id);

     // Handle a student that does not exist
     if (!deletedStudent) {
       return res.status(404).json({
         success: false,
         message: "Student not found.",
       });
     }

     res.status(200).json({
       success: true,
       message: "Student record deleted successfully.",
       studentId: String(deletedStudent._id),
     });
   } catch (error) {
     console.error("Error deleting student:", error.message);

     res.status(500).json({
       success: false,
       message: "Unable to delete student.",
     });
   }
 });

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from backend/.env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully.");

    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Backend startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
