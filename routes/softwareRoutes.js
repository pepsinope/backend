import express from "express";
import { getSoftwareList, checkSoftwareStatus } from "../controllers/softwareController.js";

const router = express.Router();

// ✅ ดึงรายชื่อซอฟต์แวร์ทั้งหมด
router.get("/software-list", getSoftwareList);

// ✅ เช็คสถานะและระดับ (level) ของซอฟต์แวร์
router.get("/check-software-status", checkSoftwareStatus);

export default router;
