import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "cspp_database",
  port: process.env.DB_PORT || 3306,
});

// ใช้ async/await ในการเชื่อมต่อ MySQL
const connectToDatabase = async () => {
  try {
    // ใช้ query test เพื่อทดสอบการเชื่อมต่อ
    const [rows, fields] = await pool.query('SELECT 1');
    console.log("✅ MySQL connected!");
  } catch (err) {
    console.log("❌ Error connecting to MySQL:", err);
  }
};

// เรียกฟังก์ชันการเชื่อมต่อ
connectToDatabase();

export default pool;
