const express = require("express");
const router = express.Router();

const passwordController = require("../controllers/passwordController");

router.post("/forgotpassword", (req,res,next)=>{
  console.log("Forgot password route hit");
  next();
}, passwordController.forgotPassword);

module.exports = router;