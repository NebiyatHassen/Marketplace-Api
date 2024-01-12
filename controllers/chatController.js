const mongoose = require("mongoose");
const Chat = require("../Models/chat");
const User = require("../Models/userModal");

const sendChat = async (req, res) => {
  try {
    const { senderId, recipientId, chatType, msg } = req.body;
    const senderUser = await User.findById(senderId);
    const recipientUser = await User.findById(recipientId);

    if (!senderUser || !recipientUser) {
      throw new Error("Sender or recipient user not found");
    }
    if (!recipientUser.friends.some((friend) => friend._id.equals(senderId))) {
      recipientUser.friends.push(senderUser);
      await recipientUser.save();
    }
    if (!senderUser.friends.some((friend) => friend._id.equals(recipientId))) {
      senderUser.friends.push(recipientUser);
      await senderUser.save();
    }
    const newChat = new Chat({
      senderId,
      recipientId,
      chatType,
      msg,
      timestamp: new Date(),
    });

    await newChat.save();
    res.status(200).json({ chat: "Chat sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getChat = async (req, res) => {
  const { senderId, recipientId } = req.params;

  try {
    const chats = await Chat.find({
      $or: [
        { senderId: senderId, recipientId: recipientId },
        { senderId: recipientId, recipient: senderId },
      ],
    }).populate("sender", "_id");

    res.json(chats);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getChat,
  sendChat,
};
