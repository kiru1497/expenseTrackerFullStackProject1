const UsersSignup = require("../models/usersSignup");
const ForgotPasswordRequests = require("../models/forgotPasswordRequests");

const axios = require("axios");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

// ================= FORGOT PASSWORD =================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UsersSignup.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Generate UUID reset token
    const id = uuidv4();

    // Store reset request in DB
    await ForgotPasswordRequests.create({
      id: id,
      usersSignupId: user.id,
      isActive: true,
    });

    const resetLink = `http://localhost:3000/password/resetpassword/${id}`;

    // Send email via Brevo
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: "kiran.r1497@gmail.com",
          name: "Expense Tracker",
        },
        to: [
          {
            email: email,
          },
        ],
        subject: "Password Reset Request",
        textContent: `
Hello,

You requested a password reset for your Expense Tracker account.

Click the link below to reset your password:

${resetLink}

If you did not request this, please ignore this email.
`,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      },
    );

    res.status(200).json({
      message: "Password reset email sent",
    });
  } catch (error) {
    console.log("BREVO ERROR:", error.response?.data || error);

    res.status(500).json({
      message: "Failed to send email",
    });
  }
};

// ================= RESET PASSWORD PAGE =================

const resetPasswordPage = async (req, res) => {
  try {
    const id = req.params.id;

    const request = await ForgotPasswordRequests.findOne({
      where: { id: id },
    });

    if (!request || request.isActive === false) {
      return res.status(404).send("Invalid or expired reset link");
    }

    res.send(`
      <h2>Reset Password</h2>

      <form action="/password/updatepassword/${id}" method="POST">
        <input 
          type="password" 
          name="newpassword" 
          placeholder="Enter new password" 
          required 
        />
        <br/><br/>
        <button type="submit">Reset Password</button>
      </form>
    `);
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
};

// ================= UPDATE PASSWORD =================

const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newpassword } = req.body;

    const request = await ForgotPasswordRequests.findOne({
      where: { id: id },
    });

    if (!request || request.isActive === false) {
      return res.status(404).send("Invalid or expired reset link");
    }

    const user = await UsersSignup.findByPk(request.usersSignupId);

    const hashedPassword = await bcrypt.hash(newpassword, 10);

    user.password = hashedPassword;

    await user.save();

    // Deactivate reset link
    request.isActive = false;

    await request.save();

    res.send(
      "Password updated successfully. You can now login with the new password.",
    );
  } catch (error) {
    console.log(error);
    res.status(500).send("Failed to update password");
  }
};

module.exports = {
  forgotPassword,
  resetPasswordPage,
  updatePassword,
};
