const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* ======================
   CREATE JOURNAL
====================== */
router.post("/", authMiddleware, async (req, res) => {
  const { entry_text, entry_date } = req.body;
  const userId = req.user.id;

  if (!entry_text || !entry_date) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    await db.promise().query(
      "INSERT INTO journals (user_id, entry_text, entry_date) VALUES (?, ?, ?)",
      [userId, entry_text, entry_date]
    );

    res.status(201).json({ message: "Journal entry created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   GET ALL JOURNALS (USER)
====================== */
router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const [journals] = await db.promise().query(
      "SELECT id, entry_text, entry_date FROM journals WHERE user_id = ? ORDER BY entry_date DESC",
      [userId]
    );

    res.json(journals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   UPDATE JOURNAL
====================== */
router.put("/:id", authMiddleware, async (req, res) => {
  const journalId = req.params.id;
  const { entry_text } = req.body;
  const userId = req.user.id;

  try {
    const [result] = await db.promise().query(
      "UPDATE journals SET entry_text = ? WHERE id = ? AND user_id = ?",
      [entry_text, journalId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Journal not found" });
    }

    res.json({ message: "Journal updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   DELETE JOURNAL
====================== */
router.delete("/:id", authMiddleware, async (req, res) => {
  const journalId = req.params.id;
  const userId = req.user.id;

  try {
    const [result] = await db.promise().query(
      "DELETE FROM journals WHERE id = ? AND user_id = ?",
      [journalId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Journal not found" });
    }

    res.json({ message: "Journal deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
