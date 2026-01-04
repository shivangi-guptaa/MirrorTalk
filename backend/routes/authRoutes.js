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

  if (!name || !email || !password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Invalid signup data",
    });
  }

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

    await db
      .promise()
      .query(
        "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
        [name, email, passwordHash]
      );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
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
          "INSERT INTO users (name, email) VALUES (?, ?)",
          [name || "Google User", email]
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

module.exports = router;
