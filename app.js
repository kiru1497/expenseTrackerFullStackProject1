const express = require("express");
const app = express();
const session = require("express-session");
const path = require("path");
require("dotenv").config();
const compression = require("compression");
const morgan = require("morgan");
const fs = require("fs");

const userRoutes = require("./routes/userRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const passwordRoutes = require("./routes/passwordRoutes");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" },
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    },
  }),
);

app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

//  Serve static files
app.use(express.static(path.join(__dirname, "public")));

//  Page routes (VERY IMPORTANT)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/expense-page", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "expense.html"));
});

//  API routes
app.use("/user", userRoutes);
app.use("/expense", expenseRoutes);
app.use("/payment", paymentRoutes);
app.use("/password", passwordRoutes);

const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/expenseDB")
  .then(() => {
    console.log("MongoDB connected");

    // ✅ Start server AFTER DB connects
    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch((err) => {
    console.log("DB connection failed:", err);
  });
