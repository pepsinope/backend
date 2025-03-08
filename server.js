// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import bodyParser from "body-parser";
// import sshRoutes from "./routes/commandRoutes.js";
// import installRoutes from "./routes/installRoutes.js";
// import uploadRoutes from "./controllers/uploadController.js";
// import resultRoutes from "./routes/resultRoutes.js";
// import softwareRoutes from "./routes/softwareRoutes.js";

// dotenv.config();// โหลดค่าจากไฟล์ .env

// const app = express();
// app.use(express.json());
// app.use(cors());
// app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: true }));

// // ✅ ตั้งค่า CORS ให้ React เรียก API ได้
// app.use(
//   cors({
//     origin: "http://localhost:5173", // เปลี่ยนเป็น URL ของ React ถ้าใช้ port อื่น
//     methods: ["GET", "POST"],
//   })
// );

// // ✅ ใช้ Routes ที่แยกออกมา
// app.use("/software", softwareRoutes); // ใช้ route /software
// app.use(resultRoutes);
// app.use(sshRoutes);
// app.use("/install", installRoutes);
// app.use(uploadRoutes);
// app.use(resultRoutes);

// // ✅ Route ทดสอบว่าเซิร์ฟเวอร์ทำงานหรือไม่
// app.get("/", (req, res) => {
//   res.json({ message: "Server is running!" });
// });

// // ✅ Error Handling Middleware
// app.use((err, req, res, next) => {
//   console.error("Error:", err);
//   res.status(500).json({
//     message: "Something went wrong!",
//     error: err.message,
//   });
// });

// // 📌 API สำหรับหยุดรันเซิร์ฟเวอร์
// app.post("/shutdown", (req, res) => {
//   console.log("🛑 Server is shutting down...");
//   res.json({ message: "Server shutting down..." });
//   process.exit(0);
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import softwareRoutes from "./routes/softwareRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import sshRoutes from "./routes/sshRoutes.js";
import installRoutes from './routes/installRoutes.js';
import bodyParser from "body-parser";
import uploadRoutes from "./controllers/uploadController.js";
// import commandRoutes from "./routes/commandRoutes.js";
import pkg from "ssh2";
const { Client } = pkg;
import mysql from 'mysql2'; // เชื่อมต่อ MySQL
 
// กำหนดค่าการเชื่อมต่อ MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
 
// db.connect((err) => {
//   if (err) {
//     console.error("❌ MySQL Connection Error:", err);
//     process.exit(1); // ถ้าเชื่อมต่อไม่ได้ ให้หยุดการทำงานของแอป
//   }
//   console.log("✅ MySQL Connected!");
// });
 
// กำหนดค่าการเชื่อมต่อ SSH
const sshConfig = {
  host: process.env.SSH_HOST,
  port: process.env.SSH_PORT || 22,
  username: process.env.SSH_USER,
  password: process.env.SSH_PASSWORD,
};
 
dotenv.config(); // โหลดค่าจากไฟล์ .env
 
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
 
 
 
 
// ✅ ตั้งค่า CORS ให้ React เรียก API ได้
app.use(
  cors({
    origin: "http://localhost:5173", // เปลี่ยนเป็น URL ของ React ถ้าใช้ port อื่น
    methods: ["GET", "POST"],
  })
);
 
// ✅ ใช้ Routes ที่แยกออกมา
app.use("/software", softwareRoutes); // ใช้ route /software
app.use(resultRoutes);
app.use(sshRoutes);
app.use("/install", installRoutes);
app.use(uploadRoutes);
 
// ✅ Route ทดสอบว่าเซิร์ฟเวอร์ทำงานหรือไม่
app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});
 
// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    message: "Something went wrong!",
    error: err.message,
  });
});
 
 
 
 
 
 
// สถานะการทำงานของแต่ละกล่อง
let isRunning = {
  SDR: false,
  EDR: false,
  Flood: false,
  SurfaceReflectance: false,
};
 
// เก็บสถานะการรันของแต่ละ task
const runningTasks = {};
 
// 📌 API สำหรับรันคำสั่ง SSH
app.post("/start-command", (req, res) => {
  const { boxType } = req.body;
  if (!boxType) return res.status(400).json({ error: "Missing 'boxType' in request body" });
  if (runningTasks[boxType]) return res.status(400).json({ error: `${boxType} is already running` });
 
  runningTasks[boxType] = true;
  isRunning[boxType] = true;
 
  let command = "";
  switch (boxType) {
    // case "SDR":
    //   command = `
    //     cd pepsi4.1/CSPP/SDR_4_1/bin &&
    //     export CSPP_SDR_HOME=/home/jpss/pepsi4.1/CSPP/SDR_4_1 &&
    //     ./cspp_sdr_runtime.sh &&
    //     ./sdr_luts.sh &&
    //     ./sdr_ancillary.sh &&
    //     ./viirs_sdr.sh /home/jpss/pepsi4.1/rawdata/RNSCA-RVIRS_j01_d20250114_t0711288_e0724169_b00001_c20250114073423860000_drlu_ops.h5
    //   `;
    //   break;
    case "Flood":
      command = "cd /home/jpss/suphattra && chmod +x run_flood2.sh && ./run_flood2.sh";
      break;
    default:
      return res.status(400).json({ error: "Invalid box type" });
  }
 
 
 
  // สร้าง SSH connection
  const conn = new Client();
 
 
 
 
  conn.on("ready", () => {
    console.log(`✅ SSH Connection Established for ${boxType}`);
 
 
    conn.exec(command, (err, stream) => {
      if (err) {
        console.error("❌ Error starting shell:", err);
        conn.end();
        isRunning[boxType] = false;
        delete runningTasks[boxType];
        if (!res.headersSent) {
          return res.status(500).json({ error: "Shell initialization failed" });
        }
        return; // ✅ ป้องกันไม่ให้ส่ง response ซ้ำ
      }
 
      // เริ่มสตรีม output
      let output = "";
      let detectedComplete = false;
 
 
      stream.on("data", (data) => {
        const message = data.toString();
        console.log("📡 OUTPUT:", message);
        output += message;
        // 📌 ตรวจจับข้อความที่บ่งบอกว่า process เสร็จสิ้น
        if (message.includes("Data inserted successfully") || message.includes(".tif")) {
          detectedComplete = true;
 
 
        }
      });
 
      stream.on("close", async () => {
 
        console.log(`🔴 SSH Connection Closed for ${boxType}`);
        console.log("📂 Output from SSH:", output);
        conn.end();
 
        // รอให้ SSH process เสร็จสมบูรณ์ก่อน
        await new Promise((resolve) => setTimeout(resolve, 2000));
 
        console.log("📂 Checking for .tif file in output...");
        console.log("📡 Output:", output);
 
        isRunning[boxType] = false; // รีเซ็ตสถานะเมื่อรันเสร็จ
        delete runningTasks[boxType];
 
 
        if (!res.headersSent) {
          res.json({ output, progress: 100, status: "Completed" });
        }
 
 
 
 
 
        // ค้นหาเฉพาะไฟล์ .tif จากเอาต์พุต
        const tifFilePattern = /([a-zA-Z0-9_\-]+\.tif)/;  // หาชื่อไฟล์ .tif
        const tifFileMatch = output.match(tifFilePattern);
        const tifFile = tifFileMatch ? tifFileMatch[0] : null;
        const nameSoftware = boxType; // หรือกำหนดให้รับค่าจาก process ที่รัน
        const processStatus = tifFile ? 1 : 2;
        const saveStatus = tifFile ? 1 : 2;
        if (!tifFile) {
          console.warn("⚠️ No TIF file found in SSH output.");
          return res.json({ message: "No TIF file found", process_status: 2, save_status: 2 });
        } else {
          console.log(`📂 TIF file detected: ${tifFile}`);
        }
        if (tifFile) {
          // บันทึกไฟล์ .tif ลงในฐานข้อมูล
          db.query("INSERT INTO snpp (filename,date, name_software, process_status, save_status) VALUES (?, CURDATE(), ?, ?, ?) ON DUPLICATE KEY UPDATE process_status = VALUES(process_status), save_status = VALUES(save_status)",
            [tifFile, nameSoftware, processStatus, saveStatus], (err, result) => {
              if (err) {
                console.error('❌ Error inserting data into database:', err);
                return res.status(500).json({ error: 'Database error' });
              }
 
              console.log(`✅ Data inserted successfully: ${tifFile || "No TIF file"}`);
 
              // ส่งคำตอบให้กับ client
              return res.json({
                message: 'Process complete',
                tif_file: tifFile,
                process_status: 1,
                save_status: 1,
              });
            });
        } else {
          console.warn("⚠️ No TIF file found.");
          return res.json({
            message: "No TIF file found",
            process_status: processStatus,
            save_status: saveStatus
          });
        }
        // รันคำสั่ง
        console.log("🚀 Running Command:", command);
        stream.write(command + "\n");
      });
    });
  });
  conn.on("error", (err) => {
    console.error(`❌ SSH Connection Error for ${boxType}:`, err);
    isRunning[boxType] = false;
    delete runningTasks[boxType];
    res.status(500).json({ error: "SSH Connection Failed" });
 
  });
 
  conn.connect(sshConfig);
 
  res.json({ message: `Started ${boxType}` });
});
 
// 📌 API ตรวจสอบ progress
// app.get("/check-progress", (req, res) => {
//   res.json(progressStates);
// });
 
// 📌 API สำหรับหยุดเซิร์ฟเวอร์
app.post("/shutdown", (req, res) => {
  console.log("🛑 Server is shutting down...");
  res.json({ message: "Server shutting down..." });
  process.exit(0);
});
 
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));