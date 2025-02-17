import express from "express";
import { addResult, getResults } from "../controllers/resultController.js";

const router = express.Router();

router.post("/add-result", addResult);
router.get("/results", getResults);

export default router;
