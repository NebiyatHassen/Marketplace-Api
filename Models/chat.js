const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  senderId: {
    type: String,
  },
  recipientId: {
    type: String,
  },
  chatType: {
    type: String,
    enum: ["text", "image"],
  },
  chat: String,
  timeStamp: {
    type: Date,
    default: Date.now,
  },
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
