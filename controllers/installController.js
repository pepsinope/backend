import pool from '../config/db.js'; 

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

  // อัปเดตสถานะติดตั้งซอฟต์แวร์
  export const updateSoftwareStatus = (req, res) => {
    console.log("Received Request:", req.body); // ตรวจสอบค่าที่ส่งมา
  
    const { software_id, status } = req.body;
  
    if (software_id == null || status == null) {
      return res.status(400).json({ error: 'Missing software_id or status' });
    }
  
    const query = 'UPDATE software SET status = ? WHERE id = ?';
  
    pool.query(query, [status, software_id])
      .then(([results]) => {
        console.log("Database Update Result:", results);
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'Software not found' });
        }
  
        res.status(200).json({ message: 'Status updated successfully' });
      })
      .catch((err) => {
        console.error('Error during query execution:', err);
        return res.status(500).json({ error: 'Failed to update status', details: err });
      });
  };

  export const getSoftwareFiles = async (req, res) => {
    try {
      console.log("Received request:", req.query.categories);
  
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
  
      console.log("Final JSON:", Object.values(softwareGrouped));
  
      res.setHeader("Content-Type", "application/json");
      res.status(200).json({ software_files: Object.values(softwareGrouped) });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };