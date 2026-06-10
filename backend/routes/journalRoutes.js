const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================
   ADD / UPDATE GRATITUDE
   (UPSERT – same day editable)
========================= */
router.post("/", authMiddleware, async (req, res) => {
  const { gratitude_1, gratitude_2, gratitude_3, entry_date } = req.body;
  const userId = req.user.id || req.user.userId;

  const g1 = gratitude_1?.trim() || null;
  const g2 = gratitude_2?.trim() || null;
  const g3 = gratitude_3?.trim() || null;

  if (!g1 && !g2 && !g3) {
    return res.status(400).json({
      success: false,
      message: "At least one gratitude is required"
    });
  }

  if (!entry_date) {
    return res.status(400).json({
      success: false,
      message: "Entry date is required"
    });
  }

  try {
    await db.promise().query(
      `
      INSERT INTO gratitude_entries
        (user_id, gratitude_1, gratitude_2, gratitude_3, entry_date)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        gratitude_1 = VALUES(gratitude_1),
        gratitude_2 = VALUES(gratitude_2),
        gratitude_3 = VALUES(gratitude_3)
      `,
      [userId, g1, g2, g3, entry_date]
    );

    res.json({
      success: true,
      message: "Gratitude noted for today"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/* =========================
   GET GRATITUDE HISTORY
   ✅ FIXED: added id to SELECT so frontend can delete by id
========================= */
router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user.id || req.user.userId;

  try {
    const [rows] = await db.promise().query(
      `
      SELECT id, gratitude_1, gratitude_2, gratitude_3, entry_date
      FROM gratitude_entries
      WHERE user_id = ?
      ORDER BY entry_date DESC
      `,
      [userId]
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/* =========================
   DELETE GRATITUDE ENTRY
   Deletes by id with user_id ownership check
========================= */
router.delete("/:id", authMiddleware, async (req, res) => {
  const entryId = req.params.id;
  const userId = req.user.id || req.user.userId;

  try {
    const [result] = await db.promise().query(
      "DELETE FROM gratitude_entries WHERE id = ? AND user_id = ?",
      [entryId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Gratitude entry not found"
      });
    }

    res.json({ success: true, message: "Gratitude entry deleted" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;