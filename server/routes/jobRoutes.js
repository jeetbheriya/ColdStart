const express = require("express");
const router = express.Router();
const {
  getJobs,
  postJob,
  deleteJob,
  updateJob,
} = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getJobs);
router.post("/", protect, postJob);
router.delete("/:id", protect, deleteJob);
router.put("/:id", protect, updateJob);

module.exports = router;
