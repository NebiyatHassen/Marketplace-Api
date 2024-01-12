const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  user_id: {
    type: String,
  },
  email: {
    type: String,
    required: [true, " Email is  required"],
  },
  title: {
    type: String,
    required: [true, " Title is  required"],
  },
  price: {
    type: Number,
    required: [true, " Price is  required"],
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone Number is  required"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
  image: {
    type: String,
    required: [true, "Image is  required"],
  },
});

const listing = mongoose.model("listing", listingSchema);
module.exports = listing;
