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

    // 💾 Save order in MongoDB
    const order = new Order({
      orderId,
      amount,
      status: "PENDING",
      userId: userId, // ✅ correct field
    });

    await order.save();

    // 💳 Create payment session (Cashfree)
    const paymentSessionId = await createOrder(
      orderId,
      amount,
      "INR",
      userId.toString(),
      "9999999999",
    );

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

    // 🔍 Find order
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).send("Order not found");
    }

    // 🔄 Fetch latest status from Cashfree
    const response = await fetchOrder(orderId);

    console.log("Cashfree order status:", response.data);

    const paymentStatus = response.data.order_status;

    if (paymentStatus === "PAID") {
      // ✅ Update order status
      order.status = "SUCCESS";
      await order.save();

      // 🔍 Find user
      const user = await UsersSignup.findById(order.userId);

      if (user) {
        user.isPremium = true;
        await user.save();
      }
    }

    // 🔁 Redirect after verification
    return res.redirect("/expense-page"); // ⚠️ matches your app.js route
  } catch (error) {
    console.log("Verification error:", error);
    res.status(500).send("Payment verification failed");
  }
};

module.exports = {
  createCashfreeOrder,
  verifyPayment,
};
