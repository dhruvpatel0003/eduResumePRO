const Resume = require("../models/Resume");
const {
  fetchUserRepos,
  buildProjectFromRepo,
} = require("../utils/githubService");
const mongoose = require("mongoose");

class GithubController {
  // 1) PREVIEW repos for username (no save to DB)
  static async previewProjects(req, res) {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ error: "GitHub username required" });
      }

      const repos = await fetchUserRepos(username);

      // Filter non-forks, non-archived, with description
      const filteredRepos = repos
        .filter((r) => !r.fork && !r.archived && r.description)
        .slice(0, 20);

      const previewProjects = [];
      for (const repo of filteredRepos) {
        const project = await buildProjectFromRepo(repo);
        previewProjects.push(project);
      }

      res.json({
        success: true,
        username,
        totalRepos: repos.length,
        previewProjects,
      });
    } catch (err) {
      console.error("Preview error:", err.message);
      if (err.message.includes("404")) {
        return res.status(404).json({ error: `User ${username} not found` });
      }
      res.status(500).json({ error: "Failed to preview GitHub projects" });
    }
  }

  // 2) IMPORT selected projects to resume
  static async importToResume(req, res) {
    try {
      const { resumeId } = req.params;
      const { selectedProjects } = req.body; // [{ repoFullName: 'user/repo' }]

      if (!Array.isArray(selectedProjects) || selectedProjects.length === 0) {
        return res
          .status(400)
          .json({ error: "selectedProjects array required" });
      }

      const resume = await Resume.findById(resumeId);
      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }

      if (resume.userId.toString() !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const importedProjects = [];
      for (const { repoFullName } of selectedProjects) {
        const [owner, repoName] = repoFullName.split("/");

        // Fetch repo details
        const repos = await fetchUserRepos(owner);
        const targetRepo = repos.find((r) => r.name === repoName);

        if (targetRepo) {
          const project = await buildProjectFromRepo(targetRepo);

          // Transform for resume format
          const resumeProject = {
            _id: new mongoose.Types.ObjectId(),
            name: project.name,
            description: project.description,
            technologies: project.languages.slice(0, 6), // Top 6 techs
            link: project.htmlUrl,
            githubUrl: project.htmlUrl,
            startDate: project.createdAt ? new Date(project.createdAt) : null,
            endDate: project.pushedAt ? new Date(project.pushedAt) : null,
            stars: project.stars,
            languages: project.primaryLanguage,
            topics: project.topics,
          };

          importedProjects.push(resumeProject);
        }
      }

      // Add to resume projects
      resume.templateInfo.projects.push(...importedProjects);
      await resume.save();

      res.json({
        success: true,
        message: `${importedProjects.length} projects imported successfully`,
        importedProjects,
        resumeId: resume._id,
      });
    } catch (err) {
      console.error("Import error:", err.message);
      res.status(500).json({ error: "Failed to import projects" });
    }
  }

  static async deleteProjectFromResume(req, res) {
    try {
      const { resumeId, projectId } = req.params;

      const resume = await Resume.findById(resumeId);
      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }
      if (resume.userId.toString() !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const beforeCount = resume.templateInfo.projects.length;

      // Filter out the project with matching _id
      resume.templateInfo.projects = resume.templateInfo.projects.filter(
        (p) => p._id.toString() !== projectId,
      );

      if (resume.templateInfo.projects.length === beforeCount) {
        return res
          .status(404)
          .json({ error: "Project not found on this resume" });
      }

      await resume.save();

      res.json({
        success: true,
        message: "Project removed from resume",
        resumeId: resume._id,
        remainingProjects: resume.templateInfo.projects,
      });
    } catch (err) {
      console.error("Delete project error:", err);
      res.status(500).json({ error: "Failed to delete project" });
    }
  }
}

module.exports = GithubController;
