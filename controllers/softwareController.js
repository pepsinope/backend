import pool from "../config/db.js"; // ✅ เชื่อมต่อ MySQL จาก db.js

// ✅ เช็คสถานะซอฟต์แวร์จากฐานข้อมูล
export const checkSoftwareStatus = async (req, res) => {
  try {
    const { name_software } = req.query; // รับค่าจาก Query String
    if (!name_software) {
      return res.status(400).json({ error: "Missing software name" });
    }

    // ✅ ค้นหา software จากตาราง software (ไม่ต้องใส่ชื่อ database ซ้ำ)
    const [rows] = await pool.query(
      "SELECT status FROM software WHERE name_software = ?",
      [name_software]
    );

    if (rows.length > 0) {
      return res.json({ status: rows[0].status });
    } else {
      return res.status(404).json({ error: "Software not found" });
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
