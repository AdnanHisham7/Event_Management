const express = require("express");
const router = express.Router();
const pool = require("../models/db");

// Add a new participant
router.post("/", async (req, res) => {
  const { name, email } = req.body;
  console.log(name, email)
  try {
    const result = await pool.query(
      "INSERT INTO participants (name, email) VALUES ($1, $2) RETURNING *",
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding participant:", error);
    if (error.code === "23505") {
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: "Failed to add participant" });
    }
  }
});



// Fetch all participants
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM participants ORDER BY name");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ error: "Failed to fetch participants" });
  }
});

// Remove a participant
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM participants WHERE participant_id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Participant not found" });
    }
    res.status(200).json({ message: "Participant removed successfully" });
  } catch (error) {
    console.error("Error deleting participant:", error);
    res.status(500).json({ error: "Failed to delete participant" });
  }
});

module.exports = router;
