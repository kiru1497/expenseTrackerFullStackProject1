const mongoose = require("mongoose");

const forgotSchema = new mongoose.Schema({
  _id: {
    type: String, // UUID
  },
  isActive: {
    type: Boolean,
    default: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("ForgotPasswordRequest", forgotSchema);
