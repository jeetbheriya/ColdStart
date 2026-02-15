const Application = require("../models/Application");

exports.applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "Resume upload is compulsory!" });
    }

    const existingApp = await Application.findOne({ job: jobId, applicant: userId });
    if (existingApp) {
      return res.status(400).json({ message: "You have already applied for this role." });
    }

    const newApplication = await Application.create({
      job: jobId,
      applicant: userId,
      resume: req.file.path, // Save the path provided by Multer
      status: "pending"
    });

    res.status(201).json({ message: "Applied successfully! 🚀", application: newApplication });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}; 

exports.getCompanyApplicants = async (req, res) => {
  try {
    // Find applications where the job's 'postedBy' matches the company ID
    const applications = await Application.find()
      .populate({
        path: "job",
        match: { postedBy: req.user.id } // Only jobs posted by this company
      })
      .populate("applicant", "name email headline skills about profilePicture") // Get user details
      .exec();

    // Filter out applications for jobs that didn't match the company ID
    const companyApps = applications.filter(app => app.job !== null);

    res.status(200).json(companyApps);
  } catch (error) {
    res.status(500).json({ message: "Error fetching applicants", error: error.message });
  }
};