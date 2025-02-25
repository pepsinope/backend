import express from "express";
import { checkSoftwareStatus } from "../controllers/softwareController.js";

const router = express.Router();

// ✅ Route ตรวจสอบสถานะซอฟต์แวร์
router.get("/check-status", checkSoftwareStatus);

export default router;
