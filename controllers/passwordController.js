const UsersSignup = require("../models/usersSignup");
const axios = require("axios");

const forgotPassword = async (req, res) => {

  try {

    const { email } = req.body;

    const user = await UsersSignup.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: "kiran.r1497@gmail.com",
          name: "Expense Tracker"
        },
        to: [
          {
            email: email
          }
        ],
        subject: "Password Reset Request",
        textContent: `
Hello,

You requested a password reset for your Expense Tracker account.

If this was not you, please ignore this email.
`
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.status(200).json({
      message: "Email sent successfully"
    });

  } catch (error) {

    console.log("BREVO ERROR:", error.response?.data || error);

    res.status(500).json({
      message: "Failed to send email"
    });

  }

};

module.exports = {
  forgotPassword
};