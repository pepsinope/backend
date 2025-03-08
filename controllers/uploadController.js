import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Client } from "ssh2"; // ใช้ ssh2 สำหรับเชื่อมต่อ SSH
import dotenv from "dotenv";

// กำหนด __dirname ใน ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const router = express.Router();

// ตั้งค่า multer สำหรับรับไฟล์
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// กำหนดค่าเซิร์ฟเวอร์ปลายทาง
const serverIP = process.env.SSH_HOST || "103.156.150.73";
const remotePath = "/home/jpss/pepsi4.1/importdata";
const username = process.env.SSH_USER || "jpss";
const privateKey = process.env.SSH_PRIVATE_KEY || ""; // หากใช้ SSH key แทนรหัสผ่าน

// API สำหรับอัปโหลดไฟล์
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.json({ success: false, message: "Uploaded file not found" });
  }

  // แปลงเส้นทางให้เป็น UNIX-style
  const filePath = path.posix.join(__dirname, "../uploads", req.file.filename);
  console.log(`📂 ไฟล์ถูกอัปโหลดที่: ${filePath}`);

  const conn = new Client();
  conn.on("ready", () => {
    console.log("SSH connection established.");
    conn.sftp((err, sftp) => {
      if (err) {
        console.error(`❌ SFTP Error: ${err}`);
        return res.status(500).json({ success: false, message: `SFTP Error: ${err}` });
      }

      // ส่งไฟล์ไปที่เซิร์ฟเวอร์
      sftp.fastPut(filePath, remotePath + "/" + req.file.filename, (err) => {
        if (err) {
          console.error(`❌ ส่งไฟล์ล้มเหลว: ${err}`);
          return res.status(500).json({ success: false, message: `Failed to send file: ${err}` });
        }
        console.log(`✅ ไฟล์ถูกส่งไปที่ ${serverIP}:${remotePath}`);
        conn.end(); // ปิดการเชื่อมต่อ SSH

        return res.status(200).json({ success: true, message: "File upload successful!" });
      });
    });
  }).on("error", (err) => {
    console.error(`❌ การเชื่อมต่อ SSH ล้มเหลว: ${err}`);
    return res.status(500).json({ success: false, message: `SSH connection failed: ${err}` });
  }).connect({
    host: serverIP,
    port: 22,
    username: username,
    privateKey: privateKey ? Buffer.from(privateKey, 'base64') : undefined, // ใช้ SSH key ถ้ามี
    password: process.env.SSH_PASSWORD || "", // ใช้รหัสผ่านถ้าไม่มี SSH key
  });
});

export default router;
