const Order = require("../models/order");
const UsersSignup = require("../models/usersSignup");
const { createOrder, fetchOrder } = require("../services/cashfreeService");
const { v4: uuidv4 } = require("uuid");

// ================= CREATE ORDER =================

const createCashfreeOrder = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const orderId = "order_" + uuidv4();
    const amount = 999;

    // 1️⃣ Save order in DB with PENDING status
    await Order.create({
      orderId,
      amount,
      status: "PENDING",
      usersSignupId: userId,
    });

    // 2️⃣ Call Cashfree to create payment session
    const paymentSessionId = await createOrder(
      orderId,
      amount,
      "INR",
      userId.toString(),
      "9999999999",
    );

    // 3️⃣ Send session ID to frontend
    res.status(200).json({
      paymentSessionId,
    });
  } catch (error) {
    console.log("Order creation error:", error);
    res.status(500).json({
      message: "Failed to create order",
    });
  }
};

// ================= VERIFY PAYMENT =================

const verifyPayment = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // 1️⃣ Find order in DB
    const order = await Order.findOne({ where: { orderId } });

    if (!order) {
      return res.status(404).send("Order not found");
    }

    // 2️⃣ Fetch latest order status from Cashfree
    const response = await fetchOrder(orderId);

    console.log("Cashfree order status:", response.data);

    const paymentStatus = response.data.order_status;

    if (paymentStatus === "PAID") {
      // 3️⃣ Update order status
      order.status = "SUCCESS";
      await order.save();

      // 4️⃣ Update user premium status
      const user = await UsersSignup.findByPk(order.usersSignupId);

      if (user) {
        user.isPremium = true;
        await user.save();
      }
    }

    // 5️⃣ Redirect to expense page
    return res.redirect("/expense");
  } catch (error) {
    console.log("Verification error:", error);
    res.status(500).send("Payment verification failed");
  }
};

module.exports = {
  createCashfreeOrder,
  verifyPayment,
};
