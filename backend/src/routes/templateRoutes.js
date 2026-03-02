const express = require("express");
const router = express.Router();
const templateController = require("../controllers/templateController");
const authMiddleware = require("../middleware/auth");

// Get all templates (public)
router.post("/", authMiddleware, templateController.uploadTemplate);
router.get("/", templateController.listTemplates);
router.delete('/:id', authMiddleware, templateController.deleteTemplate);
router.get('/:templateId/pdf', authMiddleware, templateController.getTemplatePdf);

module.exports = router;
