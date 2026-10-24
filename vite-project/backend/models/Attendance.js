
import mongoose from "mongoose";

// Define one class attendance session
const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },

    className: {
      type: String,
      required: true,
      enum: ["CSE", "ECE", "IT"],
    },

    section: {
      type: String,
      required: true,
      enum: ["21", "22", "23"],
    },

    students: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        rollNo: {
          type: String,
          required: true,
        },

        status: {
          type: String,
          enum: ["Present", "Absent"],
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Only one attendance session per class, section and date
attendanceSchema.index(
  { className: 1, section: 1, date: 1 },
  { unique: true }
);

const Attendance = mongoose.model(
  "Attendance",
  attendanceSchema
);

export default Attendance;
