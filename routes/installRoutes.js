const express = require("express");
const { installCSPP } = require("../controllers/installController");

const router = express.Router();

router.post("/install", installCSPP);

module.exports = router;
