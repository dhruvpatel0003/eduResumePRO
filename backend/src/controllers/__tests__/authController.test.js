const httpMocks = require('node-mocks-http');
const authController = require('../authController');
const User = require('../../models/User');
const Notification = require('../../models/Notification');
const generateToken = require('../../utils/generateToken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../../utils/sendEmail');
const jwt = require('jsonwebtoken');

jest.mock('../../models/User');
jest.mock('../../models/Notification');
jest.mock('../../utils/generateToken');
jest.mock('bcryptjs');
jest.mock('../../utils/sendEmail');
jest.mock('jsonwebtoken');
jest.mock('../../metrics', () => ({
  userSignups: { inc: jest.fn() },
  logins: { inc: jest.fn() },
  failedLoginAttemptsTotal: { inc: jest.fn() }
}));

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should return 400 if required fields are missing', async () => {
      req.body = { email: 'test@example.com' };
      await authController.signup(req, res);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({ message: 'Please provide all required fields' });
    });

    it('should return 400 if user exists', async () => {
      req.body = { name: 'Test', email: 'test@example.com', password: 'password' };
      User.findOne.mockResolvedValue({ _id: '123', email: 'test@example.com' });
      await authController.signup(req, res);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({ message: 'User already exists' });
    });

    it('should create user and return 201', async () => {
      req.body = { name: 'Test', email: 'test@example.com', password: 'password', role: 'student' };
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedpassword');
      
      const mockUser = {
        _id: '123', name: 'Test', email: 'test@example.com', role: 'student',
        save: jest.fn().mockResolvedValue()
      };
      // We need to bypass the actual User constructor and just mock save
      User.mockImplementation(() => mockUser);
      Notification.create.mockResolvedValue();
      generateToken.mockReturnValue('mocktoken');

      await authController.signup(req, res);
      
      expect(res.statusCode).toBe(201);
      expect(JSON.parse(res._getData())).toEqual({
        message: 'User created successfully',
        token: 'mocktoken',
        user: { id: '123', name: 'Test', email: 'test@example.com', role: 'student' }
      });
    });
  });

  describe('login', () => {
    it('should return 400 if fields missing', async () => {
      req.body = { email: 'test@example.com' };
      await authController.login(req, res);
      expect(res.statusCode).toBe(400);
    });

    it('should return 401 for invalid password', async () => {
      req.body = { email: 'test@example.com', password: 'wrongpassword' };
      User.findOne.mockResolvedValue({ _id: '123', password: 'hashedpassword' });
      bcrypt.compare.mockResolvedValue(false);
      
      await authController.login(req, res);
      expect(res.statusCode).toBe(401);
    });

    it('should login successfully', async () => {
      req.body = { email: 'test@example.com', password: 'password' };
      User.findOne.mockResolvedValue({ _id: '123', name: 'Test', email: 'test@example.com', role: 'student', password: 'hashedpassword' });
      bcrypt.compare.mockResolvedValue(true);
      generateToken.mockReturnValue('mocktoken');
      Notification.create.mockResolvedValue();

      await authController.login(req, res);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Login successful',
        token: 'mocktoken',
        user: { id: '123', name: 'Test', email: 'test@example.com', role: 'student' }
      });
    });
  });

  describe('logout', () => {
    it('should return 200', async () => {
      await authController.logout(req, res);
      expect(res.statusCode).toBe(200);
    });
  });

  describe('forgotPassword', () => {
    it('should return 404 if user not found', async () => {
      req.body = { email: 'none@example.com' };
      User.findOne.mockResolvedValue(null);
      await authController.forgotPassword(req, res);
      expect(res.statusCode).toBe(404);
    });

    it('should generate token and send email', async () => {
      req.body = { email: 'test@example.com' };
      const mockUser = { _id: '123', email: 'test@example.com', save: jest.fn().mockResolvedValue() };
      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mockJWTToken');
      sendEmail.mockResolvedValue();
      
      await authController.forgotPassword(req, res);
      expect(res.statusCode).toBe(200);
      expect(mockUser.resetPasswordToken).toBe('mockJWTToken');
      expect(sendEmail).toHaveBeenCalled();
    });
  });
});
