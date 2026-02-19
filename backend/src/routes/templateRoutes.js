const express = require("express");
const router = express.Router();
const templateController = require("../controllers/templateController");
const authMiddleware = require("../middleware/auth");

// Get all templates (public)
router.post("/", authMiddleware, templateController.uploadTemplate);
router.get("/", templateController.listTemplates);

module.exports = router;
