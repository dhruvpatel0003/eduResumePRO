const axios = require("axios");
const Resume = require("../models/Resume");
const {
  extractResumeText,
  analyzeJobMatch,
} = require("../utils/hunterService");
const { jobsAnalyzed, externalApiDurationSeconds } = require("../metrics");

class HunterController {
  static async getDynamicCompanies(req, res) {
    try {
      const {
        location,
        companyType = "engineering",
        keywords = "software engineer",
      } = req.body;

      if (!location) {
        return res
          .status(400)
          .json({ success: false, message: "Location is required" });
      }

      const serpParams = {
        engine: "google_jobs",
        q: `${keywords} ${companyType}`,
        l: location,
        num: 20,
        api_key: process.env.SERPAPI_KEY,
      };

      const endTimer = externalApiDurationSeconds.startTimer({ service: 'serpapi' });
      const response = await axios.get("https://serpapi.com/search.json", {
        params: serpParams,
      });
      endTimer();

      const companies =
        response.data.jobs_results?.map((job) => ({
          name: job.company_name || "Unknown Company",
          location: job.location || location,
          type: companyType,
          jobCount: 1,
          jobTitle: job.title,
          companyUrl: job.company_url || "",
          detectedLocation: location,
        })) || [];

      const uniqueCompanies = companies.filter(
        (company, index, self) =>
          index === self.findIndex((c) => c.name === company.name),
      );

      return res.json({
        success: true,
        companies: uniqueCompanies.slice(0, 15),
        total: uniqueCompanies.length,
      });
    } catch (error) {
      console.error("Hunter company search error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch companies. Please try again.",
      });
    }
  }

  // 2) Fast job fetch for selected company
  static async getJobsForCompany(req, res) {
    try {
      const { company, location, keywords = "software engineer" } = req.body;

      if (!company || !location) {
        return res.status(400).json({
          success: false,
          message: "company and location are required",
        });
      }

      const serpParams = {
        engine: "google_jobs",
        q: `${keywords} ${company}`,
        l: location,
        num: 10,
        api_key: process.env.SERPAPI_KEY,
      };

      const endTimer = externalApiDurationSeconds.startTimer({ service: 'serpapi' });
      const response = await axios.get("https://serpapi.com/search.json", {
        params: serpParams,
      });
      endTimer();

      const jobs =
        response.data.jobs_results?.map((job) => ({
          jobId: job.job_id,
          title: job.title,
          company: job.company_name,
          location: job.location,
          description: job.job_description || job.description,
          url: job.job_apply_link || job.link,
          postedAt: job.posted_at,
        })) || [];

      return res.json({
        success: true,
        jobs,
        total: jobs.length,
      });
    } catch (error) {
      console.error("Hunter jobs error:", error.message);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch jobs" });
    }
  }

  // 3) AI Analysis + ATS Score + Feedback
  static async analyzeJobs(req, res) {
    try {
      const { resumeId, jobs } = req.body;

      if (!resumeId || !Array.isArray(jobs) || jobs.length === 0) {
        return res.status(400).json({
          success: false,
          message: "resumeId and non-empty jobs array are required",
        });
      }

      const resume = await Resume.findById(resumeId);
      if (!resume) {
        return res
          .status(404)
          .json({ success: false, message: "Resume not found" });
      }

      const resumeText = extractResumeText(resume.templateInfo);
      const analyzedJobs = [];

      for (const job of jobs.slice(0, 5)) {
        const analysis = await analyzeJobMatch(resumeText, job);

        analyzedJobs.push({
          ...job,
          atsScore: analysis.atsScore,
          matchScore: analysis.matchScore,
          feedback: analysis.feedback,
          missingKeywords: analysis.missingKeywords,
        });
      }

      analyzedJobs.sort((a, b) => b.atsScore - a.atsScore);

      const overallAtsScore = analyzedJobs.length
        ? Math.round(
            analyzedJobs.reduce((sum, job) => sum + job.atsScore, 0) /
              analyzedJobs.length,
          )
        : 0;

      jobsAnalyzed.inc(analyzedJobs.length); // Track number of jobs analyzed

      return res.json({
        success: true,
        jobs: analyzedJobs,
        overallAtsScore,
      });
    } catch (error) {
      console.error("Hunter analyze error:", error.message);
      return res
        .status(500)
        .json({ success: false, message: "Analysis failed" });
    }
  }
}

module.exports = HunterController;
