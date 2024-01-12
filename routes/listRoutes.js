const express = require("express");
const authController = require("./../controllers/authController");
const listController = require("./../controllers/listController");
const router = express.Router();

router
  .route("/")
  .get(listController.getAllListings)
  .post(listController.uploadListingImages, listController.createListing);

router.get("/myList", listController.getUserListings);
router.route("/expoPushTokens").post(listController.pushToken);
router.route("/getToken/:id").get(listController.getToken);
router.route("/chat").post(listController.sendMessage);

router
  .route("/:id")
  .delete(listController.deleteListing)
  .post(listController.sendNotification, listController.sendMessage)
  .get(listController.getList)
  .put(listController.uploadListingImages, listController.updateProduct);
router.route("/new").get(authController.protect, listController.getNewListing);
module.exports = router;
