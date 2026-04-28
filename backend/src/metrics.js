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

// --- NEW DEVOPS METRICS ---

const apiErrorsTotal = new client.Counter({
  name: 'eduresume_api_errors_total',
  help: 'Total API errors (4xx and 5xx)',
  labelNames: ['endpoint', 'status_code']
});

const failedLoginAttemptsTotal = new client.Counter({
  name: 'eduresume_failed_login_attempts_total',
  help: 'Total failed login attempts (brute force tracking)'
});

const externalApiDurationSeconds = new client.Histogram({
  name: 'eduresume_external_api_duration_seconds',
  help: 'Duration of external API calls (e.g. Hunter, GitHub)',
  labelNames: ['service'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const dbQueryDurationSeconds = new client.Histogram({
  name: 'eduresume_db_query_duration_seconds',
  help: 'Duration of database queries',
  labelNames: ['operation', 'model'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1]
});

const activeDbConnections = new client.Gauge({
  name: 'eduresume_active_db_connections',
  help: 'Number of active MongoDB connections'
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
register.registerMetric(apiErrorsTotal);
register.registerMetric(failedLoginAttemptsTotal);
register.registerMetric(externalApiDurationSeconds);
register.registerMetric(dbQueryDurationSeconds);
register.registerMetric(activeDbConnections);

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
  apiErrorsTotal,
  failedLoginAttemptsTotal,
  externalApiDurationSeconds,
  dbQueryDurationSeconds,
  activeDbConnections,
  register,
  // metricsMiddleware
};
