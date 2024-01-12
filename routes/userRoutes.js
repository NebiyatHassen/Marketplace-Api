const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");
const multer = require("multer");
const router = express.Router();
const upload = multer({ dest: "Images" });
const User = require("./../Models/userModal");

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.get("/countUsers", authController.protect, authController.countUsers);
router.get("/profileUserName", userController.getUser);
router.put(
  "/profile",
  userController.uploadUserImage,
  userController.profileUpdate
);
router.route("/getCustomers").get(userController.getCustomers);
router.route("/:recipientId").get(userController.getChat);

router
  .route("/")
  .get(userController.getAllUsers)
  .post(authController.protect, userController.createUser);

router
  .route("/:email")
  .delete(authController.protect, userController.deleteUser);

module.exports = router;
