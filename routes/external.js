import express from "express";
import pool from "../db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import axios from "axios";
import {
  validateLogin,
  validateRefreshToken,
  validateConfiguration,
  validateId,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

// Require token for this route
router.use(authMiddleware);

// GET /api/external/:id
router.get("/external/:id", validateId, async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT configuration_url FROM configuration WHERE tenant_id = ?",
      [id]
    );
    conn.release();
    if (rows.length === 0) {
      return res.status(404).json({ error: "Configuration not found" });
    }

    const configUrl = rows[0].configuration_url;
    // Call the external API (simulated login here)
    const response = await axios.post(
      configUrl,
      {
        email: "eve.holt@reqres.in",
        password: "cityslicka",
      },
      {
        headers: {
          "x-api-key": "reqres-free-v1",
        },
      }
    );

    // Return external API response
    res.json({
      message: "External API called successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("External API call error:", error.message);
    res.status(500).json({
      error: "Failed to call external API",
      details: error.response?.data || error.message,
    });
  }
});

export default router;
