const { Client } = require("ssh2");
const pool = require('../config/db'); // Assuming the pool is already configured for MySQL



// ลิงก์ที่ต้องการดาวน์โหลด
const fileLinks = {
 
};

const downloadAndExtract = (req, res) => {
  const { categories } = req.body; // รับค่าจาก API

  if (!categories || categories.length === 0) {
    return res.status(400).json({ error: "Please select at least one category." });
  }

  // ดึงไฟล์ที่ต้องดาวน์โหลด
  let selectedFiles = [];
  categories.forEach((cat) => {
    if (fileLinks[cat]) {
      selectedFiles = selectedFiles.concat(fileLinks[cat]);
    }
  });

  if (selectedFiles.length === 0) {
    return res.status(400).json({ error: "Invalid category selected." });
  }

  const conn = new Client();

  conn
    .on("ready", () => {
      console.log("SSH Connection Established");
      let cmd = `cd /home/jpss/CSPP/beam &&`;

      // คำสั่งดาวน์โหลด + แตกไฟล์
      selectedFiles.forEach((file) => {
        cmd += ` wget ${file} && tar -xzf $(basename ${file}) &&`;
      });

      // ลบไฟล์ .tar.gz หลังแตกไฟล์เสร็จ
      cmd += ` rm -f *.tar.gz`;

      // รันคำสั่งในเซิร์ฟเวอร์
      conn.exec(cmd, (err, stream) => {
        if (err) {
          console.error("Error executing command:", err);
          return res.status(500).json({ error: "Command execution failed." });
        }

        stream
          .on("close", (code, signal) => {
            console.log("Installation complete.");
            conn.end();
            
            // Update the installation status in the database
            const softwareNames = categories.join(', '); // Join selected categories as software names
            updateSoftwareStatus(softwareNames, 1); // Status 1 means installed
            
            res.json({ message: "Installation completed", installed: selectedFiles });
          })
          .on("data", (data) => console.log("STDOUT: " + data))
          .stderr.on("data", (data) => console.error("STDERR: " + data));
      });
    })
    .on("error", (err) => {
      console.error("SSH Connection Error:", err);
      res.status(500).json({ error: "SSH connection failed" });
    })
    .connect(sshConfig);
};

// Function to update the software status in the database
const updateSoftwareStatus = (softwareName, status) => {
  const query = `INSERT INTO software_status (name, status) VALUES (?, ?)`;

  pool.query(query, [softwareName, status], (err, results) => {
    if (err) {
      console.error("Error updating software status in the database:", err);
    } else {
      console.log("Software status updated successfully:", results);
    }
  });
};

module.exports = { downloadAndExtract };
