const mongoose = require("mongoose");
const validator = require("validator");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  pushToken: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    validate: [validator.isEmail, "Please Provide a email"],
    unique: true,
  },
  password: {
    type: String,
    minlength: 8,
    trim: true,
    select: false,
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same",
    },
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  customers: [
    {
      type: mongoose.Schema.Types.Mixed,
      ref: "User",
    },
  ],
  image: {
    type: String,
  },
  status: {
    type: String,
    enum: ["Active", "Deactive"],
    default: "Active",
  },
  role: {
    type: String,
    default: "User",
  },
  passwordChangedAt: Date,
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
const User = mongoose.model("User", userSchema);
module.exports = User;
