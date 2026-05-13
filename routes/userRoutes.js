const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const isAuthenticated = require("../middleware/auth");

router.post("/signup", userController.addUser);
router.post("/login", userController.loginUser);
router.post("/logout", userController.logoutUser);

router.get("/me", isAuthenticated, userController.getUser);

module.exports = router;
