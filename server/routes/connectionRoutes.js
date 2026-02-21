const express = require("express");
const router = express.Router();
const {
  sendConnectionRequest,
  respondToRequest,
  getPendingRequests,
  getMyNetwork,
} = require("../controllers/connectionController");
const { protect } = require("../middleware/authMiddleware");

// Base path: /api/connections
router.post("/request/:userId", protect, sendConnectionRequest);
router.put("/respond/:connectionId", protect, respondToRequest);
router.get("/pending", protect, getPendingRequests);
router.get("/network", protect, getMyNetwork);

module.exports = router; // CRITICAL: This MUST be the router, not the functions!
