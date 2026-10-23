
import mongoose from "mongoose";

// Define the structure of one student document
const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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

    rollNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create the Student model
const Student = mongoose.model("Student", studentSchema);

export default Student;
