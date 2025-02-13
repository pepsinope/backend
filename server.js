import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mysql from "mysql2";
import cors from "cors";
import { Client } from "ssh2";

const app = express();
app.use(express.json());
app.use(cors());

// ตั้งค่าการเชื่อมต่อฐานข้อมูล MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "cspp_database",
  port: process.env.DB_PORT || 3306,
});

// เชื่อมต่อฐานข้อมูล
pool.getConnection((err, connection) => {
  if (err) {
    console.log("❌ Error connecting to MySQL:", err);
    return;
  }
  console.log("✅ MySQL connected!");
  connection.release();
});

// API เพิ่มข้อมูลผลลัพธ์
app.post("/add-result", async (req, res) => {
  const { date, filename, image, status, save } = req.body;

  pool.query(
    "INSERT INTO snpp (date, filename, image, status, save) VALUES (?, ?, ?, ?, ?)",
    [date, filename, image, status, save],
    (err, results) => {
      if (err) {
        console.log("❌ Error inserting data:", err);
        return res.status(400).send();
      }
      res.status(201).json({ message: "✅ New result added!" });
    }
  );
});

// API อ่านข้อมูลจากฐานข้อมูล
app.get("/results", async (req, res) => {
  pool.query("SELECT * FROM snpp", (err, results) => {
    if (err) {
      console.log("❌ Error fetching data:", err);
      return res.status(400).send();
    }
    res.status(200).json(results);
  });
});

// ตั้งค่า SSH สำหรับเชื่อมต่อเซิร์ฟเวอร์ผ่าน Putty
const sshConfig = {
  host: process.env.SSH_HOST,
  port: process.env.SSH_PORT || 22,
  username: process.env.SSH_USER,
  password: process.env.SSH_PASSWORD,
};

// API สั่งคำสั่งผ่าน SSH
app.get("/run-command", (req, res) => {
  const conn = new Client();

  conn.on("ready", () => {
    console.log("✅ SSH Connected!");

    const command = `
      cd mo && cd CSPP && cd SDR_4_0 && cd bin && 
      export CSPP_SDR_HOME=/home/jpss/mo/CSPP/SDR_4_0 && 
      ./sdr_luts.sh && ./sdr_ancillary.sh &&
      ./viirs_sdr.sh /home/jpss/mo/cspp_sdr_test_data/viirs_test/input_j01RNSCA-RVIRS_j01_d20240911_t1955034_e2006262_b00001_c20240911200637112000_drlu_ops.h5
    `;

    conn.exec(command, (err, stream) => {
      if (err) {
        console.error("❌ Error executing command:", err);
        return res.status(500).json({ error: "Error executing command" });
      }

      let output = "";
      stream
        .on("data", (data) => {
          output += data.toString();
        })
        .on("end", () => {
          conn.end();
          console.log("✅ Command executed!");
          res.json({ output });
        })
        .stderr.on("data", (data) => {
          console.error("❌ STDERR:", data.toString());
        });
    });
  });

  conn.on("error", (err) => {
    console.error("❌ SSH Connection Error:", err);
    res.status(500).json({ error: "SSH Connection Failed" });
  });

  conn.connect(sshConfig);
});

// เริ่มต้นเซิร์ฟเวอร์
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
