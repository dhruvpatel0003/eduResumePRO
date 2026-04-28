const httpMocks = require('node-mocks-http');
const DescriptionController = require('../descriptionController');
const Description = require('../../models/Description');
const axios = require('axios');

jest.mock('../../models/Description');
jest.mock('axios');

describe('Description Controller', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest({ user: { id: 'user123' } });
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  describe('generateDescription', () => {
    it('should return 400 if type is invalid', async () => {
      req.body = { type: 'invalid_type', brief: 'test' };
      await DescriptionController.generateDescription(req, res);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({ error: 'Type must be "job" or "project"' });
    });

    it('should return 400 if brief and points are missing', async () => {
      req.body = { type: 'job', brief: '', points: [] };
      await DescriptionController.generateDescription(req, res);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({ error: 'Provide brief or points' });
    });

    it('should successfully generate and return text', async () => {
      req.body = { type: 'job', brief: 'Did some testing', points: ['Fixed bugs'] };
      
      const mockAxiosResponse = {
        data: { choices: [{ message: { content: 'Collaborated on fixing critical bugs.' } }] }
      };
      axios.post.mockResolvedValue(mockAxiosResponse);
      
      // We don't save out in unit test but pretend it works (no crash)
      Description.mockImplementation(() => ({ _id: 'desc123' }));

      await DescriptionController.generateDescription(req, res);
      
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
        descriptionId: 'desc123',
        generatedText: 'Collaborated on fixing critical bugs.',
        type: 'job',
        inputUsed: { brief: 'Did some testing', points: 1, context: undefined }
      });
      expect(axios.post).toHaveBeenCalled();
    });

    it('should return 401 if Perplexity API key is invalid', async () => {
      req.body = { type: 'project', brief: 'Built an app' };
      axios.post.mockRejectedValue({ response: { status: 401 } });

      await DescriptionController.generateDescription(req, res);
      expect(res.statusCode).toBe(401);
    });
  });

  describe('buildPrompt', () => {
    it('should build prompt correctly with context', () => {
      const prompt = DescriptionController.buildPrompt('job', 'Test brief', ['Point1'], 'Test context');
      expect(prompt).toContain('Test brief');
      expect(prompt).toContain('Point1');
      expect(prompt).toContain('Test context');
    });
  });
});
