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

// ✅ Serve static files
app.use(express.static(path.join(__dirname, "public")));

// ✅ Page routes (VERY IMPORTANT)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/expense", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "expense.html"));
});

// ✅ API routes
app.use("/user", userRoutes);
app.use("/expense", expenseRoutes);
app.use("/payment", paymentRoutes);
app.use("/password", passwordRoutes);

const { connectDb, sequelize } = require("./utils/db");
require("./models/associations");

const startServer = async () => {
  try {
    await connectDb();
    console.log("DB connection verified");

    await sequelize.sync();
    console.log("All models synced");

    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  } catch (error) {
    console.log("Failed to start server:", error);
  }
};

startServer();
