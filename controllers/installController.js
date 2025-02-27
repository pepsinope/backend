import pool from '../config/db.js'; 
import { downloadAndUploadFiles , createRemoteFolder ,removeRemoteFolder} from './sshController.js';

export const installSoftware = async (req, res) => {
  try {
    const { software_id } = req.body;

    if (!software_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ดึงข้อมูลซอฟต์แวร์จากฐานข้อมูล
    const query = `
      SELECT s.name_software AS software_name, sf.file_url
      FROM software s
      JOIN software_files sf ON s.id = sf.software_id
      WHERE s.id = ?
    `;

    const [results] = await pool.query(query, [software_id]);

    if (!results || results.length === 0) {
      return res.status(404).json({ message: "ไม่พบข้อมูลซอฟต์แวร์" });
    }

    const { software_name } = results[0];
    const remotePath = `/home/jpss/beam/load/${software_name}`;

    // สร้างโฟลเดอร์ปลายทาง
    await createRemoteFolder(remotePath);

    // เตรียมไฟล์ทั้งหมดที่จะดาวน์โหลด
    const filesToDownload = results.map(result => ({ url: result.file_url }));

    // ดาวน์โหลดและอัปโหลดไฟล์ไปยังโฟลเดอร์ที่สร้าง
    await downloadAndUploadFiles(filesToDownload, remotePath);

    // อัปเดตสถานะการติดตั้งในฐานข้อมูล
    await pool.query("UPDATE software SET status = 1 WHERE id = ?", [software_id]);

    return res.json({ message: "ติดตั้งซอฟต์แวร์สำเร็จ", software_id, status: 1 });

  } catch (error) {
    console.error("❌ ติดตั้งซอฟต์แวร์ล้มเหลว:", error);
    await pool.query("UPDATE software SET status = 2 WHERE id = ?", [software_id]);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการติดตั้ง", error: error.message });
  }
};

export const uninstallSoftware = async (req, res) => {
  try {
    const { software_id } = req.body;

    if (!software_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ดึงข้อมูลซอฟต์แวร์จากฐานข้อมูล
    const query = `
      SELECT s.name_software AS software_name
      FROM software s
      WHERE s.id = ?
    `;

    const [results] = await pool.query(query, [software_id]);

    if (!results || results.length === 0) {
      return res.status(404).json({ message: "ไม่พบข้อมูลซอฟต์แวร์" });
    }

    const { software_name } = results[0];
    const remotePath = `/home/jpss/beam/load/${software_name}`;

    // ลบโฟลเดอร์ของซอฟต์แวร์
    await removeRemoteFolder(remotePath);

    // อัปเดตสถานะการติดตั้งในฐานข้อมูล
    await pool.query("UPDATE software SET status = 0 WHERE id = ?", [software_id]);

    return res.json({ message: "ถอนการติดตั้งซอฟต์แวร์สำเร็จ", software_id, status: 0 });

  } catch (error) {
    console.error("❌ ถอนการติดตั้งซอฟต์แวร์ล้มเหลว:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการถอนการติดตั้ง", error: error.message });
  }
};

export const getCategories = async (req, res) => {
    try {
      const query = 'SELECT DISTINCT categories FROM software';
      const [results] = await pool.query(query);
      
      if (results.length === 0) {
        console.log('No categories found');
        return res.status(404).json({ error: 'No categories found' });
      }
  
      console.log('Query results:', results);
      res.json(results);
    } catch (err) {
      console.error('Unexpected error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  export const getSoftwareFiles = async (req, res) => {
    try {
      //console.log("Received request:", req.query.categories);
  
      const [rows] = await pool.query(`
        SELECT software.id AS software_id, software.categories, software.title, software.status,
               software_files.id AS file_id, software_files.file_name AS name, 
               software_files.file_url AS filename, software_files.file_size AS size
        FROM software
        LEFT JOIN software_files ON software.id = software_files.software_id
        WHERE software.categories = ?
      `, [req.query.categories]);
  
      console.log("DB Result:", rows);
  
      if (!rows.length) {
        return res.status(404).json({ message: "No data found" });
      }
  
      const softwareGrouped = rows.reduce((acc, row) => {
        if (!acc[row.software_id]) {
          acc[row.software_id] = {
            software_id: row.software_id,
            categories: row.categories,
            title: row.title,
            status: row.status,
            software_files: []
          };
        }
  
        acc[row.software_id].software_files.push({
          name: row.name,
          filename: row.filename,
          size: row.size ?? ' '
        });
  
        return acc;
      }, {});
  
      //console.log("Final JSON:", Object.values(softwareGrouped));
  
      res.setHeader("Content-Type", "application/json");
      res.status(200).json({ software_files: Object.values(softwareGrouped) });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };