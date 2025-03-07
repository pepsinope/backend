import express from "express";

const router = express.Router();

// ❌ ลบ route ที่เรียก `runCommand` ออก
// router.get("/api/run-command", async (req, res) => { ... });

export default router;
