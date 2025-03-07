import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { exec } from "child_process";
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

// API สำหรับอัปโหลดไฟล์
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.json({ success: false, message: "Uploaded file not found" });
  }

  const filePath = path.join(__dirname, "../uploads", req.file.filename);
  console.log(`📂 ไฟล์ถูกอัปโหลดที่: ${filePath}`);

  const scpCommand = `scp ${filePath} ${username}@${serverIP}:${remotePath}`;

  exec(scpCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ ส่งไฟล์ล้มเหลว: ${stderr}`);
      return res.status(500).json({ success: false, message: `Failed to send file: ${stderr}` });
    }
    console.log(`✅ ไฟล์ถูกส่งไปที่ ${serverIP}:${remotePath}`);
    return res.status(200).json({ success: true, message: "File upload successful!" });
  });
});

export default router;
