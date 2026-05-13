const bcrypt = require("bcrypt");
const UsersSignup = require("../models/usersSignup");

// ➕ SIGNUP
const addUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 🔍 Check if user already exists
    const existingUser = await UsersSignup.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 💾 Create new user
    const newUser = new UsersSignup({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// 🔐 LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔍 Find user by email
    const user = await UsersSignup.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 🔑 Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Incorrect Password",
      });
    }

    // 🧠 Store user in session (Mongoose uses _id)
    req.session.userId = user._id;

    res.status(200).json({
      message: "User login successful",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// 👤 GET USER
const getUser = async (req, res) => {
  try {
    const user = await UsersSignup.findById(req.session.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      isPremium: user.isPremium,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

// 🚪 LOGOUT
const logoutUser = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          message: "Logout failed",
        });
      }

      res.clearCookie("connect.sid");

      return res.status(200).json({
        message: "Logout successful",
      });
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
module.exports = {
  addUser,
  loginUser,
  getUser,
  logoutUser,
};
