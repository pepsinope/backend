import express from 'express';
import { getCategories, getSoftwareFiles, updateSoftwareStatus } from '../controllers/installController.js';  // ใช้ import

const router = express.Router();

router.get('/categories', getCategories);
router.get('/software-files', getSoftwareFiles);
router.post("/update-status", updateSoftwareStatus);

export default router; 