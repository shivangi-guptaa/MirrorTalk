const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* ======================
   GET ALL TODOS FOR USER
====================== */
router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user.id || req.user.userId;

  try {
    const [todos] = await db.promise().query(
      "SELECT id, task_text, completed, task_date, created_at FROM todos WHERE user_id = ? ORDER BY completed ASC, id DESC",
      [userId]
    );

    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   ADD A NEW TODO
====================== */
router.post("/", authMiddleware, async (req, res) => {
  const { task_text, task_date } = req.body;
  const userId = req.user.id || req.user.userId;

  if (!task_text || !task_text.trim()) {
    return res.status(400).json({
      success: false,
      message: "Task text cannot be empty"
    });
  }

  try {
    const [result] = await db.promise().query(
      "INSERT INTO todos (user_id, task_text, task_date) VALUES (?, ?, ?)",
      [userId, task_text.trim(), task_date || new Date().toISOString().split('T')[0]]
    );

    res.status(201).json({
      success: true,
      message: "Task added",
      id: result.insertId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   TOGGLE TODO COMPLETED
====================== */
router.put("/:id/toggle", authMiddleware, async (req, res) => {
  const todoId = req.params.id;
  const userId = req.user.id || req.user.userId;

  try {
    await db.promise().query(
      "UPDATE todos SET completed = NOT completed WHERE id = ? AND user_id = ?",
      [todoId, userId]
    );

    res.json({ success: true, message: "Task status updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   DELETE TODO
====================== */
router.delete("/:id", authMiddleware, async (req, res) => {
  const todoId = req.params.id;
  const userId = req.user.id || req.user.userId;

  try {
    await db.promise().query(
      "DELETE FROM todos WHERE id = ? AND user_id = ?",
      [todoId, userId]
    );

    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
