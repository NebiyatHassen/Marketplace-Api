const mongoose = require("mongoose");
const validator = require("validator");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const notificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "A User must have a email"],
    trim: true,
  },
  user_id: {
    type: String,
    required: [true, "A User must have a id"],
    trim: true,
  },
  pushToken: {
    type: String,
  },
});
const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
