const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: String,
  amount: Number,
  status: String,

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Order", orderSchema);
