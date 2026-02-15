const Connection = require('../models/Connection');
const User = require('../models/User');

// @desc    Send a connection request
const sendConnectionRequest = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const sender = req.user; 

    if (!targetUserId) return res.status(400).json({ message: 'Target user ID required' });
    if (targetUserId === sender._id.toString()) return res.status(400).json({ message: 'Cannot connect to yourself' });

    const target = await User.findById(targetUserId);
    if (!target) return res.status(404).json({ message: 'Target user not found' });

    const existing = await Connection.findOne({
      $or: [
        { sender: sender._id, receiver: targetUserId },
        { sender: targetUserId, receiver: sender._id }
      ]
    });
    if (existing) return res.status(400).json({ message: 'Already connected or request exists' });

    const connection = new Connection({
      sender: sender._id,
      receiver: targetUserId,
      status: 'pending'
    });
    await connection.save();

    res.status(201).json({ message: "Request sent" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send request", error: error.message });
  }
};

const respondToRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { status } = req.body; 
    const connection = await Connection.findById(connectionId);
    if (!connection) return res.status(404).json({ message: "Request not found" });
    if (connection.receiver.toString() !== req.user._id.toString()) return res.status(401).json({ message: "Not authorized" });

    connection.status = status;
    await connection.save();
    res.json({ message: `Request ${status}` });
  } catch (error) {
    res.status(500).json({ message: "Failed to respond", error: error.message });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const requests = await Connection.find({ receiver: req.user._id, status: 'pending' })
      .populate('sender', 'name headline profilePicture skills');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Failed", error: error.message });
  }
};

const getMyNetwork = async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
      status: 'accepted'
    }).populate('sender receiver', 'name headline profilePicture skills');
    const network = connections.map(conn => 
      conn.sender._id.toString() === req.user._id.toString() ? conn.receiver : conn.sender
    );
    res.json(network);
  } catch (error) {
    res.status(500).json({ message: "Failed", error: error.message });
  }
};

module.exports = { sendConnectionRequest, respondToRequest, getPendingRequests, getMyNetwork };