import pool from "./db.js";

async function test() {
  let conn;
  try {
    conn = await pool.getConnection();
    // const rows = await conn.query("SELECT 1 AS result");
    const rows = await conn.query("SHOW TABLES");
    console.log(rows); // should log: [ { result: 1 } ]
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    if (conn) conn.release();
  }
}

test();
