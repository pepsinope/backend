import express from "express";
import { uploadFile } from "../controllers/uploadController.js";
import { upload } from "../config/multer.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadFile);

export default router;
