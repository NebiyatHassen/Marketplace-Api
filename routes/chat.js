const express = require("express");

// controller functions
const { sendChat, getChat } = require("../controllers/chatController");
const router = express.Router();

// message route
router.post("/", sendChat);
router.get("/:senderId/:recipientId", getChat);

module.exports = router;
