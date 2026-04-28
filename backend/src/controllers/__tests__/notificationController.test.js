const httpMocks = require('node-mocks-http');
const notificationController = require('../notificationController');
const Notification = require('../../models/Notification');

jest.mock('../../models/Notification');

describe('Notification Controller', () => {
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

  describe('getNotifications', () => {
    it('should return 200 with notifications', async () => {
      const mockNotifications = [{ _id: '1', content: 'test' }];
      Notification.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockNotifications)
      });

      await notificationController.getNotifications(req, res);
      
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockNotifications);
      expect(Notification.find).toHaveBeenCalledWith({ recipient: 'user123' });
    });

    it('should return 500 on error', async () => {
      Notification.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Db error'))
      });

      await notificationController.getNotifications(req, res);
      expect(res.statusCode).toBe(500);
    });
  });

  describe('markAsRead', () => {
    it('should return 400 if payload invalid', async () => {
      req.body = { notificationIds: 'not-an-array' };
      await notificationController.markAsRead(req, res);
      expect(res.statusCode).toBe(400);
    });

    it('should return 200 on success', async () => {
      req.body = { notificationIds: ['1', '2'] };
      Notification.updateMany.mockResolvedValue({ modifiedCount: 2 });
      await notificationController.markAsRead(req, res);
      expect(res.statusCode).toBe(200);
      expect(Notification.updateMany).toHaveBeenCalledWith(
        { _id: { $in: ['1', '2'] }, recipient: 'user123' },
        { $set: { status: 'read' } }
      );
    });
  });

  describe('deleteNotifications', () => {
    it('should return 400 if payload invalid', async () => {
      req.body = { notificationIds: null };
      await notificationController.deleteNotifications(req, res);
      expect(res.statusCode).toBe(400);
    });

    it('should return 200 on success', async () => {
      req.body = { notificationIds: ['1'] };
      Notification.deleteMany.mockResolvedValue({ deletedCount: 1 });
      await notificationController.deleteNotifications(req, res);
      expect(res.statusCode).toBe(200);
      expect(Notification.deleteMany).toHaveBeenCalledWith(
        { _id: { $in: ['1'] }, recipient: 'user123' }
      );
    });
  });
});
