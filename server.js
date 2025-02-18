import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import resultRoutes from "./routes/resultRoutes.js";
import sshRoutes from "./routes/sshRoutes.js";
import installRoutes from './routes/installRoutes.js';


const app = express();
app.use(express.json());
app.use(cors());

// ใช้ Routes ที่แยกออกมา
app.use(resultRoutes);
app.use(sshRoutes);

app.use("/install", installRoutes);

// เริ่มต้นเซิร์ฟเวอร์
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
