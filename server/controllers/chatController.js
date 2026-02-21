const Message = require("../models/Message");

// @desc    Save a new message to the database
// @route   POST /api/chat
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !content) {
      return res
        .status(400)
        .json({ message: "Receiver ID and content required" });
    }

    // Convert to string to ensure .sort() works correctly for chatId consistency
    const chatId = [senderId.toString(), receiverId.toString()]
      .sort()
      .join("_");

    const newMessage = new Message({
      chatId,
      sender: senderId,
      receiver: receiverId,
      content,
    });

    const savedMessage = await newMessage.save();

    // REMOVED: emitNotification call to keep logic simple

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Mongoose Save Error:", error);
    res
      .status(500)
      .json({ message: "Failed to send message", error: error.message });
  }
};

// @desc    Fetch message history between two specific users
// @route   GET /api/chat/:receiverId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user._id;

    // Find all messages where these two users are participants
    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to load chat history", error: error.message });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/read/:senderId
const markAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    const receiverId = req.user._id;

    await Message.updateMany(
      { sender: senderId, receiver: receiverId, read: false },
      { $set: { read: true } },
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update status", error: error.message });
  }
};

module.exports = { sendMessage, getMessages, markAsRead };
