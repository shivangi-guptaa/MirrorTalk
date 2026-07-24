const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const admin = require("../config/firebaseAdmin");

const router = express.Router();

/* ======================
   SIGNUP
====================== */
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email and a password of at least 6 characters.",
    });
  }

  const userName = name?.trim() || email.split("@")[0] || "User";

  try {
    const [existingUser] = await db
      .promise()
      .query("SELECT id FROM users WHERE email = ?", [email]);

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [result] = await db
      .promise()
      .query(
        "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
        [userName, email, passwordHash]
      );

    const token = jwt.sign(
      { id: result.insertId },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: { id: result.insertId, name, email },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   LOGIN
====================== */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   GOOGLE AUTH
====================== */
router.post("/google", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token missing",
    });
  }

  try {
    // 1️⃣ Verify Firebase ID token
    const decoded = await admin.auth().verifyIdToken(token);

    const { email, name } = decoded;

    // 2️⃣ Check if user exists
    const [users] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);

    let userId;

    if (users.length === 0) {
      // 3️⃣ Create new user (Google user)
      const [result] = await db
        .promise()
        .query(
          "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
          [name || "Google User", email, "GOOGLE_AUTH"]
        );

      userId = result.insertId;
    } else {
      userId = users[0].id;
    }

    // 4️⃣ Create backend JWT
    const appToken = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Google authentication successful",
      data: {
        token: appToken,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({
      success: false,
      message: "Invalid Google token",
    });
  }
});

/* ======================
   DELETE ACCOUNT
====================== */
const authMiddleware = require("../middleware/authMiddleware");

router.delete("/account", authMiddleware, async (req, res) => {
  const userId = req.user.id || req.user.userId;

  try {
    const [result] = await db
      .promise()
      .query("DELETE FROM users WHERE id = ?", [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

const sendEmail = require("../utils/sendEmail");

/* ======================
   FORGOT PASSWORD - GENERATE RESET CODE & SEND EMAIL
====================== */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please enter your registered email address.",
    });
  }

  try {
    const [users] = await db
      .promise()
      .query("SELECT id, name FROM users WHERE email = ?", [email.trim()]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address.",
      });
    }

    // Generate 6-digit verification code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration 15 minutes from now
    await db.promise().query(
      "UPDATE users SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE email = ?",
      [resetCode, email.trim()]
    );

    // Send email with reset code
    await sendEmail({
      to: email.trim(),
      subject: "🔑 Your MirrorTalk Password Reset Code",
      text: `Your MirrorTalk password reset code is: ${resetCode}. It is valid for 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #2D3732; background: #F9F8F3; border-radius: 14px; max-width: 480px; margin: 0 auto; border: 1px solid #EBE8E1;">
          <h2 style="color: #4A7C59; margin-top: 0;">MirrorTalk 🌿</h2>
          <p>Hi ${users[0].name || "there"},</p>
          <p>You requested to reset your password. Use the verification code below:</p>
          <div style="background: #ffffff; border: 1.5px solid #4A7C59; padding: 14px 20px; border-radius: 12px; font-size: 26px; font-weight: bold; letter-spacing: 5px; color: #4A7C59; display: inline-block; margin: 14px 0;">
            ${resetCode}
          </div>
          <p style="font-size: 12.5px; color: #78867D;">This code is valid for 15 minutes. If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #EBE8E1; margin: 20px 0;" />
          <p style="font-size: 11px; color: #78867D;">MirrorTalk — A quiet space for honest reflection</p>
        </div>
      `
    });

    res.json({
      success: true,
      message: "Password reset code sent to your email inbox.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ======================
   VERIFY RESET CODE
====================== */
router.post("/verify-reset-code", async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      success: false,
      message: "Email and verification code are required.",
    });
  }

  try {
    const [users] = await db.promise().query(
      "SELECT id FROM users WHERE email = ? AND reset_token = ? AND reset_token_expires > NOW()",
      [email.trim(), code.trim()]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code.",
      });
    }

    res.json({
      success: true,
      message: "Verification code verified successfully.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ======================
   RESET PASSWORD
====================== */
router.post("/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword || newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters.",
    });
  }

  try {
    const [users] = await db.promise().query(
      "SELECT id FROM users WHERE email = ? AND reset_token = ? AND reset_token_expires > NOW()",
      [email.trim(), code.trim()]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await db.promise().query(
      "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE email = ?",
      [newHash, email.trim()]
    );

    res.json({
      success: true,
      message: "Password reset successful! You can now log in with your new password.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
