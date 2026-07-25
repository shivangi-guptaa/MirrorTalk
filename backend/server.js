const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Security Rate Limiter: General API Limiter (100 req per 15 mins)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

// Strict Rate Limiter for Auth / Password Reset (15 req per 15 mins)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login/reset attempts. Please wait 15 minutes." },
});

app.use("/api/", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);

app.get("/", (req, res) => {
  res.send("MirrorTalk API running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);

const journalRoutes = require("./routes/journalRoutes");

app.use("/api/journals", journalRoutes);

const moodRoutes = require("./routes/moodRoutes");

app.use("/api/moods", moodRoutes);

const errorHandler = require("./middleware/errorMiddleware");

// after all routes
app.use(errorHandler);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "MirrorTalk backend is running"
  });
});

const gratitudeRoutes = require("./routes/gratitudeRoutes");
app.use("/api/gratitude", gratitudeRoutes);

const todoRoutes = require("./routes/todoRoutes");
app.use("/api/todos", todoRoutes);

module.exports = app;



