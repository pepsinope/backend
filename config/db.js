import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "cspp_database",
  port: process.env.DB_PORT || 3306,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.log("❌ Error connecting to MySQL:", err);
    return;
  }
  console.log("✅ MySQL connected!");
  connection.release();
});

export default pool;
