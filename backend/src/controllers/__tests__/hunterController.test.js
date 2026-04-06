const httpMocks = require('node-mocks-http');
const hunterController = require('../hunterController');
const Resume = require('../../models/Resume');
const axios = require('axios');
const hunterService = require('../../utils/hunterService');

jest.mock('../../models/Resume');
jest.mock('axios');
jest.mock('../../utils/hunterService');

describe('Hunter Controller', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  describe('getDynamicCompanies', () => {
    it('should return 400 if no location', async () => {
      req.body = {};
      await hunterController.getDynamicCompanies(req, res);
      expect(res.statusCode).toBe(400);
    });

    it('should return companies using axios mock', async () => {
      req.body = { location: 'NY' };
      axios.get.mockResolvedValue({
        data: { jobs_results: [{ company_name: 'Test Inc', location: 'NY' }] }
      });

      await hunterController.getDynamicCompanies(req, res);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData()).companies.length).toBe(1);
    });
  });

  describe('analyzeJobs', () => {
    it('should return 400 if missing jobs', async () => {
      req.body = { resumeId: '123', jobs: [] };
      await hunterController.analyzeJobs(req, res);
      expect(res.statusCode).toBe(400);
    });

    it('should calculate overall score', async () => {
      req.body = { resumeId: '123', jobs: [{ title: 'Dev' }] };
      Resume.findById.mockResolvedValue({ templateInfo: {} });
      hunterService.extractResumeText.mockReturnValue('test text');
      hunterService.analyzeJobMatch.mockResolvedValue({ atsScore: 80, matchScore: 90, feedback: '', missingKeywords: [] });

      await hunterController.analyzeJobs(req, res);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData()).overallAtsScore).toBe(80);
    });
  });
});
