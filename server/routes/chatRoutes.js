const router = require('express').Router();
const { sendMessage, getMessages, markAsRead } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/chat - Save message [Phase 4 Persistence]
router.post("/", protect, sendMessage);

// GET /api/chat/:receiverId - Fetch history [Day 24 Goal]
router.get("/:receiverId", protect, getMessages);

// PUT /api/chat/read/:senderId - Mark as read [Day 26 Notifications]
router.put("/read/:senderId", protect, markAsRead);

module.exports = router;