
import express from "express";
import cors from "cors";
import "dotenv/config";

// Create the Express application
const app = express();

// Use the configured port or 5000 by default
const PORT = process.env.PORT || 5000;

// Allow the local React app to send requests
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// Allow the server to read JSON request bodies
app.use(express.json());

// Basic route to check whether the server is running
app.get("/", (req, res) => {
  res.send("Student Attendance backend is running!");
});

// API endpoint for testing the backend
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend API is working",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
