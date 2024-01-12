const express = require("express");
const adminController = require("../controllers/adminController");
const authController = require("./../controllers/authController");
const router = express.Router();
router.post("/adminLogin", authController.adminLogin);

router
  .route("/")
  .post(authController.protect, adminController.createAdmin)
  .get(authController.protect, adminController.getAllAdmins)
  .patch(authController.protect, adminController.updateAdmin);
router.route("/:email").get(authController.protect, adminController.getAdmin);

module.exports = router;
