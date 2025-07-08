import mariadb from "mariadb";

const pool = mariadb.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "YTgENz3",
  database: "myapp",
  connectionLimit: 5,
});

export default pool;
