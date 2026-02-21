const Post = require("../models/Post");

// @desc    Create a new post
const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const image = req.file ? req.file.path : "";

    const newPost = new Post({
      user: req.user._id,
      content,
      image,
    });

    const savedPost = await newPost.save();
    const populatedPost = await savedPost.populate(
      "user",
      "name headline profilePicture",
    );
    res.status(201).json(populatedPost);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create post", error: error.message });
  }
};

// @desc    Get all posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name profilePicture headline")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch posts", error: error.message });
  }
};

// @desc    Delete a post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await post.deleteOne();
    res.json({ message: "Post removed" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete post", error: error.message });
  }
};

// @desc    Update a post
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    post.content = req.body.content || post.content;
    if (req.file) {
      post.image = req.file.path;
    }

    const updatedPost = await post.save();
    const populatedPost = await updatedPost.populate(
      "user",
      "name headline profilePicture",
    );
    res.json(populatedPost);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update post", error: error.message });
  }
};

// @desc    Like / Unlike a post
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(req.user._id);
      // Removed: emitNotification logic
    }
    await post.save();
    res.json(post.likes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to toggle like", error: error.message });
  }
};

// @desc    Add a comment to a post
const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const newComment = {
      user: req.user._id,
      text: req.body.text,
    };
    post.comments.push(newComment);
    await post.save();

    // Removed: emitNotification logic

    const updatedPost = await post.populate(
      "comments.user",
      "name profilePicture",
    );
    res.json(updatedPost.comments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add comment", error: error.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  deletePost,
  updatePost,
  toggleLike,
  addComment,
};
