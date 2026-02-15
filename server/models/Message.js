const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // The conversation this message belongs to (optional, but good for indexing)
  chatId: {
    type: String,
    required: true
  },
  // The person sending the message
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // The person receiving the message
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // The actual text content
  content: {
    type: String,
    required: true,
    trim: true
  },
  // To track if the receiver has seen it (useful for Phase 4 Notifications)
  read: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true // Automatically creates createdAt and updatedAt fields [cite: 5]
});

// Indexing for faster retrieval of chat history
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ chatId: 1 });

module.exports = mongoose.model('Message', messageSchema);