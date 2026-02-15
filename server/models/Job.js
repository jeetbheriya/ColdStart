const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    type: {
      type: String,
      enum: ["Remote", "On-site", "Hybrid"],
      default: "Remote",
    },
    // NEW: Granular fields for the LinkedIn-style layout
    stipend: { type: String },
    experience: { type: String },
    duration: { type: String },
    description: { type: String, required: true },
    companyDescription: { type: String },
    // Arrays for bullet-point sections
    responsibilities: [String],
    requirements: [String],
    benefits: [String],
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    category: {
      type: String,
      enum: ["Job", "Internship"],
      default: "Job",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Job", jobSchema);
