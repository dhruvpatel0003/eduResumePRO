const httpMocks = require('node-mocks-http');
const templateController = require('../templateController');
const Template = require('../../models/Template');
const gridfs = require('../../config/gridfs');
const events = require('events');

jest.mock('../../models/Template');
jest.mock('../../config/gridfs');

describe('Template Controller', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest({ user: { id: 'prof123', role: 'professor' } });
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  describe('listTemplates', () => {
    it('should return list of templates', async () => {
      const mockTemplates = [{ name: 'Temp 1' }];
      Template.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockTemplates)
      });

      await templateController.listTemplates(req, res);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockTemplates);
    });
  });

  describe('deleteTemplate', () => {
    it('should return 403 if user not professor', async () => {
      req.user.role = 'student';
      await templateController.deleteTemplate(req, res);
      expect(res.statusCode).toBe(403);
    });

    it('should return 404 if template not found', async () => {
      req.params = { id: '123' };
      Template.findOne.mockResolvedValue(null);
      await templateController.deleteTemplate(req, res);
      expect(res.statusCode).toBe(404);
    });

    it('should delete successfully', async () => {
      req.params = { id: '123' };
      Template.findOne.mockResolvedValue({ pdfGridFSId: 'grid1' });
      gridfs.deleteFromGridFS.mockResolvedValue();
      Template.findByIdAndDelete.mockResolvedValue();

      await templateController.deleteTemplate(req, res);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData()).message).toBe('Template deleted successfully');
    });
  });
});
