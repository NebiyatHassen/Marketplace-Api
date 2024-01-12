const multer = require("multer");
const express = require("express");
const Listing = require("./../Models/productModal");
const User = require("../Models/userModal");
const baseUrl = "http://10.194.65.23:9000/";
const jwt = require("jsonwebtoken");
const Notification = require("../Models/Notification");
const sendPushNotification = require("./notifications");
const { Expo } = require("expo-server-sdk");
const mongoose = require("mongoose");
const Chat = require("../Models/chat");
var ext;
var filename;

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Lists");
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
exports.createListing = async (req, res) => {
  const imageObject = req.files;

  Object.keys(imageObject).forEach((key) => {
    const images = imageObject[key];

    images.forEach((image) => {
      if (image.fieldname === "image") {
        req.body.image = image.filename;
      }
    });
  });

  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);
    req.body.email = user.email;
    req.body.user_id = userId;
    const newListing = await Listing.create(req.body);
    const lists = await Listing.find();

    res.status(201).json({
      status: "success",
      lists,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
exports.getNewListing = async (req, res) => {
  try {
    const Listings = await Listing.find().sort({ _id: -1 }).limit(5); // Reversed order and limited to 5 documents
    if (Listings.length === 0) {
      return res.status(500).send({
        message: "No files found!",
      });
    }

    let productInfos = Listings.map((doc) => ({
      image: baseUrl + doc.image,
      email: doc.email,
      title: doc.title,
      price: doc.price,
      phoneNumber: doc.phoneNumber,
      id: doc._id,
      user_id: doc.user_id,
      description: doc.description,
    }));

    res.status(200).json({
      status: "success",
      results: Listings.length,
      data: {
        productInfos: productInfos.reverse(), // Reverse the order of the retrieved documents
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      msg: err.message,
    });
  }
};
exports.getList = async (req, res) => {
  console.log(req.params.id);
  try {
    const listId = req.params.id;
    const listCheck = await Listing.findOne({ _id: listId });
    if (!listCheck) {
      return res.status(404).json({
        status: "fail",
        message: "List not found",
      });
    }
    listCheck.image = baseUrl + listCheck.image;
    res.status(200).json({
      status: "success",
      message: "List successfully deleted",
      list: listCheck,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getAllListings = async (req, res) => {
  try {
    const Listings = await Listing.find();
    if (Listings.countDocuments === 0) {
      return res.status(500).send({
        message: "No files found!",
      });
    }

    let productInfos = [];
    Listings.forEach((doc) => {
      productInfos.push({
        image: baseUrl + doc.image,
        email: doc.email,
        title: doc.title,
        price: doc.price,
        phoneNumber: doc.phoneNumber,
        id: doc._id,
        user_id: doc.user_id,
        description: doc.description,
      });
    });

    res.status(200).json({
      status: "success",
      results: Listings.length,
      data: {
        productInfos,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      msg: err.message,
    });
  }
};
exports.getUserListings = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.id;

  try {
    const Listings = await Listing.find({ user_id: userId });
    if (Listings.countDocuments === 0) {
      return res.status(500).send({
        message: "No files found!",
      });
    }

    let productInfos = [];
    Listings.forEach((doc) => {
      productInfos.push({
        image: baseUrl + doc.image,
        email: doc.email,
        title: doc.title,
        price: doc.price,
        phoneNumber: doc.phoneNumber,
        id: doc._id,
        user_id: doc.user_id,
        description: doc.description,
      });
    });

    res.status(200).json({
      status: "success",
      results: Listings.length,
      data: {
        productInfos,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      msg: err.message,
    });
  }
};
exports.deleteListing = async (req, res) => {
  try {
    const listId = req.params.id;
    const listCheck = await Listing.findOne({ _id: listId });
    if (!listCheck) {
      return res.status(404).json({
        status: "fail",
        message: "List not found",
      });
    }
    await Listing.deleteOne({ _id: listId });
    const lists = await Listing.find();
    let productInfos = [];
    lists.forEach((doc) => {
      productInfos.push({
        image: baseUrl + doc.image,
        email: doc.email,
        title: doc.title,
        price: doc.price,
        phoneNumber: doc.phoneNumber,
        id: doc._id,
        user_id: doc.user_id,
        description: doc.description,
      });
    });
    res.status(200).json({
      status: "success",
      message: "List successfully deleted",
      data: {
        productInfos,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
exports.updateProduct = async (req, res) => {
  const imageObject = req.files;
  console.log(req.body);
  Object.keys(imageObject).forEach((key) => {
    const images = imageObject[key];

    images.forEach((image) => {
      if (image.fieldname === "image") {
        req.body.image = image.filename;
      }
    });
  });
  const productId = req.params.id;
  try {
    const productCheck = await Listing.findOneAndUpdate(
      { _id: productId },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!productCheck) {
      return res.status(404).json({
        status: "fail",
        msg: "Product not found",
      });
    }
    const lists = await Listing.find();
    let productInfos = lists.map((doc) => ({
      image: baseUrl + doc.image,
      email: doc.email,
      title: doc.title,
      price: doc.price,
      phoneNumber: doc.phoneNumber,
      id: doc._id,
      user_id: doc.user_id,
      description: doc.description,
    }));
    res.status(200).json({
      status: "success",
      data: {
        productInfos: productInfos,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      msg: err.message,
    });
  }
};

exports.pushToken = async (req, res) => {
  console.log(req.body);

  try {
    const UserToken = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(UserToken, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);

    req.body.email = user.email;
    req.body.user_id = userId;
    const userToken = await Notification.create(req.body);

    res.status(201).json({
      status: "success",
      userToken,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.sendNotification = async (req, res, next) => {
  console.log(req.params.id);
  console.log(req.body);
  const currentUser = await User.findById(req.params.id);
  const { chat } = req.body;
  const pushToken = currentUser.pushToken;
  const expo = new Expo();
  if (pushToken) {
    const chunks = expo.chunkPushNotifications([
      {
        to: pushToken,
        title: "You've got mail! 📬",
        sound: "default",
        body: chat,
      },
    ]);

    const sendChunks = async () => {
      chunks.forEach(async (chunk) => {
        try {
          const tickets = await expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
          console.log("Error sending chunk", error);
        }
      });
    };

    await sendChunks();
  }
  next();
};
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, chatType, chat } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const senderId = decoded.id;
    const senderUser = await User.findById(senderId);
    const recipientUser = await User.findById(recipientId);

    if (!senderUser || !recipientUser) {
      throw new Error("Sender or recipient user not found");
    }

    // Add the senderUser to the recipientUser's friends if not already added
    if (
      !recipientUser.customers.some((customer) => customer._id.equals(senderId))
    ) {
      recipientUser.customers.push(senderUser);
      await recipientUser.save();
    }

    // Add the recipientUser to the senderUser's friends if not already added
    if (
      !senderUser.customers.some((customer) => customer._id.equals(recipientId))
    ) {
      senderUser.customers.push(recipientUser);
      await senderUser.save();
    }
    console.log(recipientUser);

    const newChat = new Chat({
      senderId,
      recipientId,
      chatType,
      chat,
      timestamp: new Date(),
    });

    await newChat.save();
    res.status(200).json({ chat: "Chat sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getToken = async (req, res) => {
  console.log(req.params.id);
  try {
    const userId = req.params.id;
    const token = await Notification.findOne({ user_id: userId });
    if (!token) {
      return res.status(404).json({
        status: "fail",
        message: "token not found",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Get Token Successfully",
      token: token,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadListingImages = upload.fields([{ name: "image", maxCount: 1 }]);
