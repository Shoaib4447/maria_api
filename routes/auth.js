import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import pool from "../db.js";

dotenv.config();
const router = express.Router();

router.post("/login", async (req, res) => {
  const { username } = req.body;

  if (!username) return res.status(400).json({ error: "Username is required" });
  try {
    // Generate tokens
    const accessToken = jwt.sign({ username }, process.env.ACCESS_SECRET, {
      expiresIn: "10m",
    });
    const refreshToken = jwt.sign({ username }, process.env.REFRESH_SECRET, {
      expiresIn: "30d",
    });

    // console.log("Access Token:", accessToken);
    // console.log("Refresh Token:", refreshToken);

    // Store tokens in db
    const conn = await pool.getConnection();
    await conn.query(
      "INSERT INTO users(access_token,refresh_token) VALUES (?,?)",
      [accessToken, refreshToken]
    );
    conn.release();
    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Login error", error);
    res.status(500).json({ error: "Login Failed" });
  }
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ error: "Refresh token required" });

  try {
    //   Checking resfresh token exist in db
    const conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT * FROM users WHERE refresh_token = ?",
      [refreshToken]
    );
    conn.release();
    if (rows.length === 0)
      return res.status(403).json({ error: "Invalid refresh token" });

    //   Verify the token
    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
      if (err)
        return res.status(403).json({ error: "Token expired or invalid" });

      //   Generate new access token
      const newAccessToken = jwt.sign(
        { username: user.username },
        process.env.ACCESS_SECRET,
        { expiresIn: "10m" }
      );
      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
});

router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(403).json({ error: "Refresh token required" });

  try {
    const conn = await pool.getConnection();

    // Clear refresh token from the DB
    const results = await conn.query(
      "DELETE FROM users WHERE refresh_token = ?",
      [refreshToken]
    );
    conn.release();

    if (results.affectedRows === 0) {
      return res
        .status(403)
        .json({ error: "Token not found or already removed" });
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

export default router;
