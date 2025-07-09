import jwt from "jsonwebtoken";
import pool from "../db.js";

export default async function authMiddleware(req, res, next) {
  try {
    // 1. Get the Authorization header
    const authHeader = req.headers.authorization;

    // 2. Check if header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access token required" });
    }

    // 3. Extract the token part
    const token = authHeader.substring(7);

    // 4. Verify the JWT token
    jwt.verify(token, process.env.ACCESS_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
      }

      // 5. Check if the token exists in the database
      try {
        const conn = await pool.getConnection();
        const rows = await conn.query(
          "SELECT * FROM users WHERE access_token = ?",
          [token]
        );
        conn.release();

        if (rows.length === 0) {
          return res.status(403).json({ error: "Token not found in database" });
        }

        // 6. Attach user info to the request and allow access
        req.user = decoded;
        next();
      } catch (dbError) {
        console.error("Database error in auth middleware:", dbError);
        return res.status(500).json({ error: "Authentication error" });
      }
    });
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ error: "Authentication error" });
  }
}
