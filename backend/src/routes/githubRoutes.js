const express = require("express");
const GithubController = require("../controllers/githubController");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

router.post("/preview", GithubController.previewProjects);
router.post("/resume/:resumeId/import", GithubController.importToResume);
router.delete("/resume/:resumeId/projects/:projectId",GithubController.deleteProjectFromResume);
module.exports = router;
