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

    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);

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

router.post("/refresh", async (req, res) => {});

export default router;
