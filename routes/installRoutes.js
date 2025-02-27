import express from 'express';
import { getCategories, getSoftwareFiles ,installSoftware ,uninstallSoftware } from '../controllers/installController.js';  // ใช้ import

const router = express.Router();

router.get('/categories', getCategories);
router.get('/software-files', getSoftwareFiles);


router.post('/installSoftware', installSoftware);
router.post('/uninstallSoftware', uninstallSoftware);

export default router; 
