const multer = require("multer");
const User = require("./../Models/userModal");
const Chat = require("./../Models/chat");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
var ext;
var filename;
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "profile");
  },
  filename: (req, file, cb) => {
    ext = file.mimetype.split("/")[1];
    filename = `Listing-image-${Date.now()}.${ext}`;
    cb(null, filename);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
exports.createUser = async (req, res) => {
  try {
    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userName: req.body.userName,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      pushToken: req.body.pushToken,
    });

    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getCustomers = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const senderId = decoded.id;

  try {
    const user = await User.findById(senderId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const customerData = user.customers;
    const customerIds = customerData.map((customer) => customer);

    // Fetch customers
    const customers = await User.find({ _id: { $in: customerIds } });
    // Fetch the last message for each conversation
    const lastMessages = await Chat.aggregate([
      {
        $match: {
          $or: [{ senderId: senderId }, { recipientId: senderId }],
        },
      },
      {
        $sort: { timeStamp: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$senderId", senderId] },
              then: "$recipientId",
              else: "$senderId",
            },
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$lastMessage" },
      },
      {
        $sort: { timeStamp: -1 }, // Sort again by timeStamp in case $first did not get the most recent message
      },
    ]);

    // Append last messages to the customers object
    const customersWithLastMessages = customers.map((customer) => {
      const lastMessage = lastMessages.find((message) => {
        const match =
          (message.senderId === String(senderId) &&
            message.recipientId === String(customer._id)) ||
          (message.senderId === String(customer._id) &&
            message.recipientId === String(senderId));

        return match;
      });

      return {
        ...customer.toObject(),
        lastMessage: lastMessage || null,
      };
    });
    res.status(200).json({ customers: customersWithLastMessages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.getChat = async (req, res) => {
  const { recipientId } = req.params;
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const senderId = decoded.id;
  console.log(senderId, recipientId);

  try {
    const chats = await Chat.find({
      $or: [
        { senderId: String(senderId), recipientId: String(recipientId) },
        { senderId: String(recipientId), recipientId: String(senderId) },
      ],
    });
    res.json(chats);
    console.log(chats);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.profileUpdate = async (req, res) => {
  const imageObject = req.files;

  Object.keys(imageObject).forEach((key) => {
    const images = imageObject[key];

    images.forEach((image) => {
      if (image.fieldname === "image") {
        req.body.image = image.filename;
      }
    });
  });
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.id;

  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          firstName: req.body.firstName,
          image: req.body.image,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the updated user data
    return res.json(updatedUser);
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateList = async (req, res) => {
  try {
    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userName: req.body.userName,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    const Users = users.filter((user) => user.role === "User");
    res.status(200).json({
      status: "success",
      results: Users.length,
      data: {
        users: Users,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      msg: err.message,
    });
  }
};
exports.getUser = async (req, res) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);

  try {
    res.status(200).json({
      status: "success",
      data: {
        currentUser,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      msg: err.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userEmail = req.params.email;
    const userCheck = await User.findOne({ email: userEmail });
    if (!userCheck) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }
    await User.deleteOne({ email: userEmail });
    const users = await User.find();

    res.status(200).json({
      status: "success",
      message: "User successfully deleted",
      users: users,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadUserImage = upload.fields([{ name: "image", maxCount: 1 }]);
