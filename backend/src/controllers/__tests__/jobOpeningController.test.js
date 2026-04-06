const httpMocks = require('node-mocks-http');
const jobOpeningController = require('../jobOpeningController');
const JobOpening = require('../../models/JobOpening');

jest.mock('../../models/JobOpening');

describe('JobOpening Controller', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all open jobs', async () => {
      JobOpening.find.mockResolvedValue([{ title: 'Dev' }]);
      await jobOpeningController.getAll(req, res);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual([{ title: 'Dev' }]);
    });
  });

  describe('getById', () => {
    it('should return job if found', async () => {
      req.params = { id: 'job1' };
      JobOpening.findById.mockResolvedValue({ title: 'Dev' });
      await jobOpeningController.getById(req, res);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({ title: 'Dev' });
    });

    it('should return 404 if not found', async () => {
      req.params = { id: 'job1' };
      JobOpening.findById.mockResolvedValue(null);
      await jobOpeningController.getById(req, res);
      expect(res.statusCode).toBe(404);
    });
  });

  describe('create', () => {
    it('should create job', async () => {
      req.body = { title: 'Dev' };
      JobOpening.mockImplementation(() => ({ save: jest.fn().mockResolvedValue(), title: 'Dev' }));
      await jobOpeningController.create(req, res);
      expect(res.statusCode).toBe(201);
    });
  });

  describe('update', () => {
    it('should update job', async () => {
      req.params = { id: 'job1' };
      req.body = { title: 'New Dev' };
      JobOpening.findByIdAndUpdate.mockResolvedValue({ title: 'New Dev' });
      await jobOpeningController.update(req, res);
      expect(res.statusCode).toBe(200);
    });
  });

  describe('delete', () => {
    it('should delete job', async () => {
      req.params = { id: 'job1' };
      JobOpening.findByIdAndDelete.mockResolvedValue(true);
      await jobOpeningController.delete(req, res);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({ message: 'Job deleted' });
    });
  });
});
