const express = require("express");
const router = express.Router();
// const { applyToJob } = require("../controllers/appController");
const { protect } = require("../middleware/authMiddleware");
const {
  applyToJob,
  getCompanyApplicants,
} = require("../controllers/applicationController");
const upload = require("../middleware/upload");

// Route to submit an application
router.post("/apply/:jobId", protect, upload.single("resume"), applyToJob);
router.get("/company", protect, getCompanyApplicants);

module.exports = router;
