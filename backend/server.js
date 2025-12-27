const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

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



