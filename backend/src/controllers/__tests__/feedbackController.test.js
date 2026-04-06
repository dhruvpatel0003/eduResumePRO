const httpMocks = require('node-mocks-http');
const feedbackController = require('../feedbackController');
const Feedback = require('../../models/Feedback');
const Notification = require('../../models/Notification');
const User = require('../../models/User');

jest.mock('../../models/Feedback');
jest.mock('../../models/Notification');
jest.mock('../../models/User');

describe('Feedback Controller', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest({ user: { id: 'prof123' } });
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create feedback and notify student', async () => {
      req.body = { resumeId: 'res1', studentId: 'stu1', overallRating: 5 };
      Feedback.mockImplementation(() => ({ save: jest.fn().mockResolvedValue() }));
      User.findById.mockResolvedValue({ email: 'prof@test.com', name: 'Dr. Test' });
      Notification.create.mockResolvedValue();

      await feedbackController.create(req, res);

      expect(res.statusCode).toBe(201);
      expect(Notification.create).toHaveBeenCalled();
    });

    it('should return 500 on error', async () => {
      Feedback.mockImplementation(() => ({ save: jest.fn().mockRejectedValue(new Error('Db error')) }));
      await feedbackController.create(req, res);
      expect(res.statusCode).toBe(500);
    });
  });

  describe('getByResumeId', () => {
    it('should return feedback for resume', async () => {
      req.params = { resumeId: 'res1' };
      const mockFeedback = [{ _id: '1' }];
      Feedback.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockFeedback)
        })
      });

      await feedbackController.getByResumeId(req, res);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockFeedback);
    });
  });

  describe('getStudentFeedback', () => {
    it('should return feedback for student', async () => {
      req.user = { id: 'stu1' };
      const mockFeedback = [{ _id: '1' }];
      Feedback.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockFeedback)
        })
      });

      await feedbackController.getStudentFeedback(req, res);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockFeedback);
    });
  });

  describe('update', () => {
    it('should update and return feedback', async () => {
      req.params = { id: '1' };
      req.body = { overallRating: 4 };
      Feedback.findByIdAndUpdate.mockResolvedValue({ _id: '1', overallRating: 4 });

      await feedbackController.update(req, res);
      expect(res.statusCode).toBe(200);
    });
  });

  describe('delete', () => {
    it('should delete feedback', async () => {
      req.params = { id: '1' };
      Feedback.findByIdAndDelete.mockResolvedValue(true);

      await feedbackController.delete(req, res);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({ message: 'Feedback deleted' });
    });
  });
});
