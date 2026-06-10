const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* ======================
   ADD / UPDATE DAILY MOOD
====================== */
router.post("/", authMiddleware, async (req, res) => {
  const { mood_level, mood_date } = req.body;
  const userId = req.user.id;

  if (!mood_level || mood_level < 1 || mood_level > 5) {
    return res.status(400).json({
      success: false,
      message: "Mood must be between 1 and 5"
    });
  }

  try {
    await db.promise().query(
      "INSERT INTO moods (user_id, mood_level, mood_date) VALUES (?, ?, ?)",
      [userId, mood_level, mood_date]
    );

    res.status(201).json({ message: "Mood added successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      await db.promise().query(
        "UPDATE moods SET mood_level = ? WHERE user_id = ? AND mood_date = ?",
        [mood_level, userId, mood_date]
      );

      return res.json({ message: "Mood updated for the day" });
    }

    res.status(500).json({ error: err.message });
  }
});

/* ======================
   GET MOOD HISTORY
   ✅ FIXED: added id to SELECT so frontend can delete by id
====================== */
router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const [moods] = await db.promise().query(
      "SELECT id, mood_level, mood_date FROM moods WHERE user_id = ? ORDER BY mood_date DESC",
      [userId]
    );

    res.json(moods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   WEEKLY MOOD SUMMARY
====================== */
router.get("/weekly-summary", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const [summary] = await db.promise().query(
      `
      SELECT 
        ROUND(AVG(mood_level), 2) AS avg_mood,
        MAX(mood_level) AS best_mood,
        MIN(mood_level) AS worst_mood,
        COUNT(*) AS total_days
      FROM moods
      WHERE user_id = ?
        AND mood_date >= CURDATE() - INTERVAL 7 DAY
      `,
      [userId]
    );

    res.json(summary[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   DELETE MOOD ENTRY
====================== */
router.delete("/:id", authMiddleware, async (req, res) => {
  const moodId = req.params.id;
  const userId = req.user.id;

  try {
    const [result] = await db.promise().query(
      "DELETE FROM moods WHERE id = ? AND user_id = ?",
      [moodId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Mood entry not found"
      });
    }

    res.json({ success: true, message: "Mood entry deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;