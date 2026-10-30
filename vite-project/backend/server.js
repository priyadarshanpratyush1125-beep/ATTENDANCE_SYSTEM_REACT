import multer from "multer";
import ExcelJS from "exceljs";
import adminRoutes from "./routes/adminRoutes.js";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

import Assignment from "./models/Assignment.js";

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";

import Student from "./models/Student.js";
import Attendance from "./models/Attendance.js";


 // Get the directory containing server.js
 const __filename = fileURLToPath(import.meta.url);
 const __dirname = path.dirname(__filename);

 // Create the uploads directory if it does not exist
 const uploadsDir = path.join(__dirname, "uploads");

 fs.mkdirSync(uploadsDir, { recursive: true });

 // Allow PDF and common image formats
 const allowedTypesByExtension = {
   ".pdf": "application/pdf",
   ".jpg": "image/jpeg",
   ".jpeg": "image/jpeg",
   ".png": "image/png",
   ".gif": "image/gif",
   ".webp": "image/webp",
   ".bmp": "image/bmp",
 };

 // Store files on disk with generated filenames
 const storage = multer.diskStorage({
   destination: (_req, _file, callback) => {
     callback(null, uploadsDir);
   },

   filename: (_req, file, callback) => {
     const extension = path.extname(file.originalname).toLowerCase();

     callback(null, `${randomUUID()}${extension}`);
   },
 });

 // Configure file limits and file type checks
 const upload = multer({
   storage,

   limits: {
     fileSize: 10 * 1024 * 1024,
     files: 1,
   },

   fileFilter: (_req, file, callback) => {
     const extension = path.extname(file.originalname).toLowerCase();
     const expectedMimeType = allowedTypesByExtension[extension];

     if (expectedMimeType && file.mimetype === expectedMimeType) {
       callback(null, true);
     } else {
       callback(
         new Error(
           "Only PDF, JPG, JPEG, PNG, GIF, WEBP and BMP files are allowed."
         )
       );
     }
   },
 });

 
// Separate upload configuration for Excel student files
const excelUpload = multer({
  // Keep the Excel file in memory instead of saving it to disk
  storage: multer.memoryStorage(),

  // Allow one Excel file up to 5 MB
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },

  // Accept only .xlsx files
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (extension === ".xlsx") {
      callback(null, true);
    } else {
      callback(
        new Error("Please upload an Excel .xlsx file only.")
      );
    }
  },
});


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
app.use("/api/admin", adminRoutes);
// Allow browser requests to retrieve uploaded files
app.use("/uploads", express.static(uploadsDir));

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


// Preview student records from an Excel file
app.post(
  "/api/students/preview-excel",

  // Upload and validate the Excel file
  (req, res, next) => {
    excelUpload.single("file")(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      next();
    });
  },

  async (req, res) => {
    try {
      // Check whether an Excel file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select an Excel file.",
        });
      }

      // Create a workbook and read the uploaded Excel file
      const workbook = new ExcelJS.Workbook();

      await workbook.xlsx.load(req.file.buffer);

      // Read the first worksheet
      const worksheet = workbook.worksheets[0];

      if (!worksheet) {
        return res.status(400).json({
          success: false,
          message: "No worksheet found in the Excel file.",
        });
      }

      // Convert Excel headings into a standard format
      const normalizeHeader = (value) =>
        String(value || "")
          .trim()
          .toLowerCase()
          .replace(/[\s_-]+/g, "");

      // Supported headings for each student field
      const requiredColumns = {
        name: ["studentname", "name"],
        className: ["class", "classname"],
        section: ["section"],
        rollNo: ["rollnumber", "rollno", "roll"],
        email: ["email", "emailaddress"],
        phone: ["phonenumber", "phone", "mobile"],
      };

      // Find the column numbers using the first row
      const headerMap = {};

      worksheet.getRow(1).eachCell((cell, columnNumber) => {
        const heading = normalizeHeader(cell.text);
        headerMap[heading] = columnNumber;
      });

      // Match the actual Excel headings to student fields
      const columnNumbers = {};

      for (const [field, possibleNames] of Object.entries(
        requiredColumns
      )) {
        const matchedHeading = possibleNames.find(
          (heading) => headerMap[heading] !== undefined
        );

        if (matchedHeading) {
          columnNumbers[field] = headerMap[matchedHeading];
        }
      }

      // Find any missing headings
      const missingColumns = Object.keys(requiredColumns).filter(
        (field) => columnNumbers[field] === undefined
      );

      if (missingColumns.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Required Excel columns are missing.",
          missingColumns,
        });
      }

      // Generate username from the student's full name
      const generateUsername = (name) => {
        return name
          .toLowerCase()
          .normalize("NFKD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "");
      };

      const students = [];
      const usedUsernames = new Set();

      // Read all student rows, starting from row 2
      for (
        let rowNumber = 2;
        rowNumber <= worksheet.rowCount;
        rowNumber++
      ) {
        const row = worksheet.getRow(rowNumber);

        const getValue = (field) =>
          String(
            row.getCell(columnNumbers[field]).text || ""
          ).trim();

        const student = {
          name: getValue("name"),
          className: getValue("className").toUpperCase(),
          section: getValue("section"),
          rollNo: getValue("rollNo"),
          email: getValue("email").toLowerCase(),
          phone: getValue("phone"),
        };

        // Ignore completely empty rows
        if (Object.values(student).every((value) => !value)) {
          continue;
        }

        // Generate a username from the full name
        const baseUsername = generateUsername(student.name);

        let username = baseUsername;

        // Handle repeated names within this Excel file
        if (usedUsernames.has(username)) {
          username = `${baseUsername}_${student.rollNo}`;
        }

        // Handle any remaining username collision
        let attempt = 1;

        while (usedUsernames.has(username)) {
          username = `${baseUsername}_${student.rollNo}_${attempt}`;
          attempt++;
        }

        usedUsernames.add(username);

        students.push({
          ...student,

          // Generated student login credentials
          username,

          // Roll number will be the initial password
          initialPassword: student.rollNo,

          // Excel row number helps identify invalid records later
          excelRow: rowNumber,
        });
      }

      if (students.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No student records found in the Excel file.",
        });
      }

      // Return student records to React for preview
      return res.json({
        success: true,
        message: "Excel file read successfully.",
        totalRecords: students.length,
        students,
      });
    } catch (error) {
      console.error("Excel preview error:", error);

      return res.status(400).json({
        success: false,
        message: "Unable to read the Excel file. Please check its format.",
      });
    }
  }
);



 // GET: Retrieve saved attendance sessions
 app.get("/api/attendance", async (req, res) => {
   try {
     const records = await Attendance.find()
       .sort({ date: -1, createdAt: -1 })
       .lean();

     res.status(200).json({
       success: true,
       count: records.length,
       records,
     });
   } catch (error) {
     console.error("Error retrieving attendance:", error.message);

     res.status(500).json({
       success: false,
       message: "Unable to retrieve attendance records.",
     });
   }
 });

 // PUT: Save or update attendance for a class, section and date
 app.put("/api/attendance", async (req, res) => {
   try {
     const { date, className, section, students } = req.body;

     // Validate the required information
     if (
       !date ||
       !["CSE", "ECE", "IT"].includes(className) ||
       !["21", "22", "23"].includes(section) ||
       !Array.isArray(students) ||
       students.length === 0
     ) {
       return res.status(400).json({
         success: false,
         message: "Valid date, class, section and students are required.",
       });
     }

     // Check every student's ID and attendance status
     const invalidEntry = students.some(
       (student) =>
         !mongoose.isValidObjectId(student.studentId) ||
         !["Present", "Absent"].includes(student.status)
     );

     if (invalidEntry) {
       return res.status(400).json({
         success: false,
         message: "Every student needs a valid ID and attendance status.",
       });
     }

     // Ensure all submitted students belong to this class and section
     const uniqueIds = [
       ...new Set(students.map((student) => String(student.studentId))),
     ];

     if (uniqueIds.length !== students.length) {
       return res.status(400).json({
         success: false,
         message: "Duplicate students are not allowed.",
       });
     }

     const matchingStudents = await Student.find({
       _id: { $in: uniqueIds },
       className,
       section,
     }).select("_id");

     if (matchingStudents.length !== students.length) {
       return res.status(400).json({
         success: false,
         message: "Some students do not belong to the selected class and section.",
       });
     }

     // Save a new session or update the existing one
     const record = await Attendance.findOneAndUpdate(
       { date, className, section },
       { $set: { students } },
       {
         new: true,
         upsert: true,
         runValidators: true,
         setDefaultsOnInsert: true,
       }
     );

     res.status(200).json({
       success: true,
       message: "Attendance saved successfully.",
       record,
     });
   } catch (error) {
     console.error("Error saving attendance:", error.message);

     res.status(500).json({
       success: false,
       message: "Unable to save attendance.",
     });
   }
 });


 // GET: Retrieve assignment information from MongoDB
 app.get("/api/assignments", async (_req, res) => {
   try {
     const assignments = await Assignment.find()
       .sort({ createdAt: -1 })
       .lean();

     res.status(200).json({
       success: true,
       count: assignments.length,
       assignments,
     });
   } catch (error) {
     console.error("Error retrieving assignments:", error.message);

     res.status(500).json({
       success: false,
       message: "Unable to retrieve assignments.",
     });
   }
 });

 // POST: Upload a file and save its information in MongoDB
 app.post(
   "/api/assignments",

   // Handle a single file with the multipart field name "file"
   (req, res, next) => {
     upload.single("file")(req, res, (error) => {
       if (error) {
         const tooLarge =
           error instanceof multer.MulterError &&
           error.code === "LIMIT_FILE_SIZE";

         return res.status(tooLarge ? 413 : 400).json({
           success: false,
           message: tooLarge
             ? "File exceeds the 10 MB upload limit."
             : error.message || "Unable to upload the file.",
         });
       }

       next();
     });
   },

   async (req, res) => {
     if (!req.file) {
       return res.status(400).json({
         success: false,
         message: "Please select a file.",
       });
     }

     try {
       const assignment = await Assignment.create({
         name: req.file.originalname,
         originalName: req.file.originalname,
         storedName: req.file.filename,
         mimeType: req.file.mimetype,
         size: req.file.size,
         fileUrl: `/uploads/${req.file.filename}`,
       });

       res.status(201).json({
         success: true,
         message: "Assignment uploaded successfully.",
         assignment,
       });
     } catch (error) {
       // Remove the stored file if saving its metadata fails
       await fs.promises
         .unlink(req.file.path)
         .catch(() => {});

       console.error("Error saving assignment:", error.message);

       res.status(500).json({
         success: false,
         message: "Unable to save assignment information.",
       });
     }
   }
 );

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
