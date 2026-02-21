const Job = require("../models/Job");

// @desc    Get all jobs
// @route   GET /api/jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Post a new job (For testing/Admins)
// @route   POST /api/jobs
exports.postJob = async (req, res) => {
  try {
    // Check if the logged-in person is a company
    if (req.user.role !== "company") {
      return res
        .status(403)
        .json({ message: "Access denied. Only companies can post jobs." });
    }

    const newJob = new Job({
      ...req.body,
      postedBy: req.user._id,
      company: req.user.name, // Automatically use the company's name
    });

    await newJob.save();
    res.status(201).json(newJob);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to post job", error: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    // 1. Find the job by ID from the URL params
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // 2. Ownership Check: Ensure the logged-in user is the one who posted it
    // req.user.id comes from your 'protect' middleware
    if (job.postedBy.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: You don't own this post" });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Verify Ownership
    if (job.postedBy.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not authorized to edit this opening" });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};
