// routes/report.js
const express = require("express");
const auth = require("../middleware/auth");
const reportController = require("../controllers/reportController");

const router = express.Router();

router.post("/analyze-resume", auth, reportController.analyzeResume);
router.post("/accept-feedback", auth, reportController.acceptReportFeedback);

module.exports = router;
