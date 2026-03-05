// routes/hunter.js
const express = require('express');
const auth = require('../middleware/auth');
const {
  getDynamicCompanies,
  getJobsForCompany,
  analyzeJobs
} = require('../controllers/hunterController');

const router = express.Router();
router.post('/companies/dynamic', auth, getDynamicCompanies);
router.post('/jobs', auth, getJobsForCompany);
router.post('/analyze', auth, analyzeJobs);

module.exports = router;
