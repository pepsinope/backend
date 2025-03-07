import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import installRoutes from "./routes/installRoutes.js";
import uploadRoutes from "./controllers/uploadController.js";
import resultRoutes from "./routes/resultRoutes.js";
import softwareRoutes from "./routes/softwareRoutes.js";


dotenv.config();// โหลดค่าจากไฟล์ .env

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
app.use("/install", installRoutes);
app.use(uploadRoutes);
app.use(resultRoutes);

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

// 📌 API สำหรับหยุดรันเซิร์ฟเวอร์
app.post("/shutdown", (req, res) => {
  console.log("🛑 Server is shutting down...");
  res.json({ message: "Server shutting down..." });
  process.exit(0);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
