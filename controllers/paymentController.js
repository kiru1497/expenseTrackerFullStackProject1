const Order = require("../models/order");
const { createOrder } = require("../services/cashfreeService");
const { v4: uuidv4 } = require("uuid");

const createCashfreeOrder = async (req, res) => {

  try {

    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const orderId = "order_" + uuidv4();
    const amount = 999; // Premium price

    // 1️⃣ Save order in DB with PENDING status
    const order = await Order.create({
      orderId,
      amount,
      status: "PENDING",
      usersSignupId: userId
    });

    // 2️⃣ Call Cashfree service
    const paymentSessionId = await createOrder(
      orderId,
      amount,
      "INR",
      userId.toString(),
      "9999999999" // Replace with real user phone later
    );

    // 3️⃣ Return session ID to frontend
    res.status(200).json({
      paymentSessionId
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to create order"
    });
  }
};

module.exports = {
  createCashfreeOrder
};