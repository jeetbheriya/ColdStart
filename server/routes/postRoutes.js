const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
const { createPost, getPosts, deletePost, updatePost, toggleLike, addComment } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// Base route: /api/posts
router.route('/')
  .get(getPosts)              // Public feed
  .post(protect, upload.single('image'), createPost); // Auth required

// Parameter route: /api/posts/:id
router.route('/:id')
  .delete(protect, deletePost) // Auth + Ownership required
  .put(protect, upload.single('image'), updatePost); // Add Multer here!

router.put('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);

module.exports = router;