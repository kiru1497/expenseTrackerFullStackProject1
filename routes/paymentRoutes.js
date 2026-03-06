const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const isAuthenticated = require("../middleware/auth");

router.post("/create-order", isAuthenticated, paymentController.createCashfreeOrder);

// ADD THIS:
router.get("/payment-status/:orderId", paymentController.verifyPayment);

module.exports = router;