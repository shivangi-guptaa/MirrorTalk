const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================
   CREATE JOURNAL ENTRY
   Multiple entries per day supported (no UNIQUE constraint on date)
========================= */
router.post("/", authMiddleware, async (req, res) => {
  const { entry_text, entry_date } = req.body;
  const userId = req.user.id || req.user.userId;

  if (!entry_text?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Journal entry text is required",
    });
  }

  if (!entry_date) {
    return res.status(400).json({
      success: false,
      message: "Entry date is required",
    });
  }

  try {
    const [result] = await db.promise().query(
      "INSERT INTO journals (user_id, entry_text, entry_date) VALUES (?, ?, ?)",
      [userId, entry_text.trim(), entry_date]
    );

    res.status(201).json({
      success: true,
      message: "Journal entry saved",
      data: { id: result.insertId },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const Sentiment = require("sentiment");
const sentimentAnalyzer = new Sentiment();

/* Helper function to classify sentiment score */
const classifySentiment = (score) => {
  if (score > 1) return { label: "Positive & Calm 🌿", color: "#4A7C59", badge: "Positive" };
  if (score < -1) return { label: "Heavier Thoughts 🌧️", color: "#6b7280", badge: "Reflective" };
  return { label: "Neutral Reflection 💭", color: "#3b82f6", badge: "Neutral" };
};

/* =========================
   GET ALL JOURNAL ENTRIES (WITH NLP SENTIMENT ANALYSIS)
========================= */
router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user.id || req.user.userId;

  try {
    const [rows] = await db.promise().query(
      `SELECT id, entry_text, entry_date, created_at
       FROM journals
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    const enrichedRows = rows.map((row) => {
      const analysis = sentimentAnalyzer.analyze(row.entry_text || "");
      const classification = classifySentiment(analysis.score);
      return {
        ...row,
        sentiment: {
          score: analysis.score,
          comparative: analysis.comparative,
          label: classification.label,
          badge: classification.badge,
          color: classification.color,
        },
      };
    });

    res.json({ success: true, data: enrichedRows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =========================
   GET SENTIMENT INSIGHTS SUMMARY
========================= */
router.get("/sentiment-insights", authMiddleware, async (req, res) => {
  const userId = req.user.id || req.user.userId;

  try {
    const [rows] = await db.promise().query(
      `SELECT entry_text FROM journals WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
      [userId]
    );

    if (rows.length === 0) {
      return res.json({
        success: true,
        data: {
          totalEntries: 0,
          avgScore: 0,
          dominantTone: "No entries yet",
          summaryText: "Start journaling to see your emotional sentiment insights!",
        },
      });
    }

    let totalScore = 0;
    let positiveCount = 0;
    let neutralCount = 0;
    let reflectiveCount = 0;

    rows.forEach((r) => {
      const res = sentimentAnalyzer.analyze(r.entry_text || "");
      totalScore += res.score;
      if (res.score > 1) positiveCount++;
      else if (res.score < -1) reflectiveCount++;
      else neutralCount++;
    });

    const avgScore = (totalScore / rows.length).toFixed(1);
    let dominantTone = "Balanced & Calm 🌿";
    if (positiveCount > neutralCount && positiveCount > reflectiveCount) {
      dominantTone = "Positive & Uplifting 🌟";
    } else if (reflectiveCount > positiveCount) {
      dominantTone = "Deep & Reflective 🌧️";
    }

    res.json({
      success: true,
      data: {
        totalEntries: rows.length,
        avgScore,
        positivePercentage: Math.round((positiveCount / rows.length) * 100),
        dominantTone,
        summaryText: `Based on your recent ${rows.length} entries, your reflections lean ${Math.round((positiveCount / rows.length) * 100)}% Positive & Calm.`,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =========================
   DELETE JOURNAL ENTRY
========================= */
router.delete("/:id", authMiddleware, async (req, res) => {
  const entryId = req.params.id;
  const userId = req.user.id || req.user.userId;

  try {
    const [result] = await db.promise().query(
      "DELETE FROM journals WHERE id = ? AND user_id = ?",
      [entryId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Journal entry not found",
      });
    }

    res.json({ success: true, message: "Journal entry deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;