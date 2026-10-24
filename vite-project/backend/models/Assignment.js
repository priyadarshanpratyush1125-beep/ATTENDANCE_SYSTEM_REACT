
import mongoose from "mongoose";

// Define the information saved for each uploaded assignment
const assignmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    storedName: {
      type: String,
      required: true,
      unique: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create the Assignment model
const Assignment = mongoose.model(
  "Assignment",
  assignmentSchema
);

export default Assignment;
