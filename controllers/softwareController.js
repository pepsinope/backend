import pool from "../config/db.js";

// ✅ ดึงรายชื่อซอฟต์แวร์ทั้งหมดจากฐานข้อมูล
export const getSoftwareList = async (req, res) => {
  try {
    // ดึงรายชื่อซอฟต์แวร์ทั้งหมด
    const [rows] = await pool.query("SELECT name_software FROM software");
    const softwareList = rows.map((row) => row.name_software);
    res.json({ softwareList });
  } catch (error) {
    console.error("❌ Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ เช็คสถานะและระดับ (level) ของซอฟต์แวร์
export const checkSoftwareStatus = async (req, res) => {
  try {
    const { name_software } = req.query;

    // เช็คว่ามีการส่งชื่อซอฟต์แวร์เข้ามาหรือไม่
    if (!name_software) {
      return res.status(400).json({ error: "Missing software name" });
    }

    // เพิ่มการดึงข้อมูล level จากฐานข้อมูล
    const [rows] = await pool.query(
      "SELECT status, level FROM software WHERE name_software = ?", // เพิ่ม level
      [name_software]
    );

    // เช็คว่ามีข้อมูลซอฟต์แวร์ที่ตรงกับชื่อที่ส่งมา
    if (rows.length > 0) {
      // ส่งข้อมูลสถานะและ level
      return res.json({
        status: rows[0].status, // สถานะของซอฟต์แวร์
        level: rows[0].level,   // ระดับ (level) ของซอฟต์แวร์
      });
    } else {
      // กรณีไม่พบซอฟต์แวร์ในฐานข้อมูล
      return res.status(404).json({ error: "Software not found" });
    }
  } catch (error) {
    console.error("❌ Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
