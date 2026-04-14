const promBundle = require("express-prom-bundle");
const client = require('prom-client');
const register = new client.Registry();

// const metricsMiddleware = promBundle({
//   includeMethod: true,
//   includePath: true,
//   includeStatusCode: true,
//   includeUp: true,
//   promClient: {
//     collectDefaultMetrics: {},
//   },
// });

// Counters (total counts)
const resumesGenerated = new client.Counter({
  name: 'eduresume_resumes_generated_total',
  help: 'Total resumes generated',
  labelNames: ['user_id', 'template_type']
});

const userSignups = new client.Counter({
  name: 'eduresume_user_signups_total',
  help: 'Total user signups',
  labelNames: ['method']  // 'google', 'email'
});

const logins = new client.Counter({
  name: 'eduresume_user_logins_total',
  help: 'Total user logins',
  labelNames: ['method']
});

const resumeDownloads = new client.Counter({
  name: 'eduresume_resume_downloads_total',
  help: 'Total number of resume downloads'
});

const jobsAnalyzed = new client.Counter({
  name: 'eduresume_jobs_analyzed_total',
  help: 'Total number of jobs analyzed via Hunter'
});

const resumesShared = new client.Counter({
  name: 'eduresume_resumes_shared_total',
  help: 'Total number of resumes shared with faculty'
});

const feedbackSubmitted = new client.Counter({
  name: 'eduresume_feedback_submitted_total',
  help: 'Total number of faculty feedback submitted'
});

// Histograms (latencies)
const pdfGenerationTime = new client.Histogram({
  name: 'eduresume_pdf_generation_seconds',
  help: 'PDF generation time',
  labelNames: ['template_type'],
  buckets: [0.1, 0.5, 1, 2, 5]  // seconds
});

const atsScoreGauge = new client.Gauge({
  name: 'eduresume_ats_score_avg',
  help: 'Average ATS score (0-100)'
});

// Register all
register.registerMetric(resumesGenerated);
register.registerMetric(userSignups);
register.registerMetric(logins);
register.registerMetric(resumeDownloads);
register.registerMetric(jobsAnalyzed);
register.registerMetric(resumesShared);
register.registerMetric(feedbackSubmitted);
register.registerMetric(pdfGenerationTime);
register.registerMetric(atsScoreGauge);

module.exports = {
  resumesGenerated,
  userSignups,
  logins,
  resumeDownloads,
  jobsAnalyzed,
  resumesShared,
  feedbackSubmitted,
  pdfGenerationTime,
  atsScoreGauge,
  register,
  // metricsMiddleware
};
