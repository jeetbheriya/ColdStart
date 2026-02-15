const Application = require("../models/Application");

exports.applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Check if already applied
    const existingApp = await Application.findOne({ 
      job: jobId, 
      applicant: req.user.id 
    });
    
    if (existingApp) {
      return res.status(400).json({ message: "You have already applied for this position." });
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user.id
    });

    res.status(201).json({ message: "Application submitted successfully!", application });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};