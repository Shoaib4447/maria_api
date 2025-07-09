import express from "express";
import pool from "../db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  validateLogin,
  validateRefreshToken,
  validateConfiguration,
  validateId,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

// All routes below are protected
router.use(authMiddleware);

// GET all configurations
router.get("/config", async (req, res) => {
  try {
    const conn = await pool.getConnection();
    // TEMP: Check what DB this connection sees
    // const tables = await conn.query("SHOW TABLES");
    // console.log("Tables visible to Node.js:", tables);
    //
    const configs = await conn.query("SELECT * FROM configuration");
    conn.release();
    res.json(configs);
  } catch (error) {
    console.error("GET config error:", error);
    res.status(500).json({ error: "Failed to fetch configuration" });
  }
});

// POST a new configuration
router.post("/config", validateConfiguration, async (req, res) => {
  const { configuration_url } = req.body;
  if (!configuration_url) {
    return res.status(400).json({ error: "configuration_url is required" });
  }

  try {
    const conn = await pool.getConnection();
    const result = await conn.query(
      "INSERT INTO configuration (configuration_url) VALUES (?)",
      [configuration_url]
    );
    conn.release();
    res
      .status(201)
      .json({ message: "Configuration saved", id: Number(result.insertId) });
  } catch (error) {
    console.error("POST config error:", error);
    res.status(500).json({ error: "Failed to save configuration" });
  }
});

// UPDATE a configuration by ID
router.put("/config/:id", validateId, async (req, res) => {
  const configuration_url = req.body.configuration_url?.trim();
  const id = Number(req.params.id);

  if (!configuration_url) {
    return res.status(400).json({ error: "configuration_url is required" });
  }

  try {
    const conn = await pool.getConnection();
    const result = await conn.query(
      "UPDATE configuration SET configuration_url = ? WHERE tenant_id = ?",
      [configuration_url, id]
    );
    conn.release();
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Configuration not found" });
    }
    res.json({ message: "Configuration updated" });
  } catch (error) {
    console.error("PUT config error:", error);
    res.status(500).json({ error: "Failed to update configuration" });
  }
});

// DELETE a configuration by ID
router.delete("/config/:id", validateId, async (req, res) => {
  const { id } = req.params;

  try {
    const conn = await pool.getConnection();
    const result = await conn.query(
      "DELETE FROM configuration WHERE tenant_id = ?",
      [id]
    );
    conn.release();
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Configuration not found" });
    }
    res.json({ message: "Configuration deleted" });
  } catch (error) {
    console.error("DELETE config error:", error);
    res.status(500).json({ error: "Failed to delete configuration" });
  }
});

export default router;
