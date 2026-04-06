const httpMocks = require('node-mocks-http');
const GithubController = require('../githubController');
const Resume = require('../../models/Resume');
const githubService = require('../../utils/githubService');
const mongoose = require('mongoose');

jest.mock('../../models/Resume');
jest.mock('../../utils/githubService');

describe('Github Controller', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest({ user: { id: 'user123' } });
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  describe('previewProjects', () => {
    it('should return 400 if no username', async () => {
      req.body = {};
      await GithubController.previewProjects(req, res);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({ error: 'GitHub username required' });
    });

    it('should preview successfully', async () => {
      req.body = { username: 'testuser' };
      githubService.fetchUserRepos.mockResolvedValue([
        { fork: false, archived: false, description: 'Test', name: 'repo1' }
      ]);
      githubService.buildProjectFromRepo.mockResolvedValue({ name: 'repo1' });

      await GithubController.previewProjects(req, res);

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData()).username).toBe('testuser');
      expect(JSON.parse(res._getData()).previewProjects[0].name).toBe('repo1');
    });
  });

  describe('importToResume', () => {
    it('should return 404 if resume not found', async () => {
      req.params = { resumeId: '1' };
      req.body = { selectedProjects: [{ repoFullName: 'user/repo' }] };
      Resume.findById.mockResolvedValue(null);

      await GithubController.importToResume(req, res);
      expect(res.statusCode).toBe(404);
    });

    it('should import selected projects successfully', async () => {
      req.params = { resumeId: '1' };
      req.body = { selectedProjects: [{ repoFullName: 'user/repo' }] };
      
      const mockResume = { userId: 'user123', templateInfo: { projects: [] }, save: jest.fn().mockResolvedValue(), _id: '1' };
      Resume.findById.mockResolvedValue(mockResume);
      
      githubService.fetchUserRepos.mockResolvedValue([{ name: 'repo' }]);
      githubService.buildProjectFromRepo.mockResolvedValue({ name: 'repo', languages: [] });

      await GithubController.importToResume(req, res);
      expect(res.statusCode).toBe(200);
      expect(mockResume.templateInfo.projects.length).toBe(1);
    });
  });

  describe('deleteProjectFromResume', () => {
    it('should remove project successfully', async () => {
      req.params = { resumeId: '1', projectId: 'p1' };
      
      const mockResume = {
        _id: '1',
        userId: 'user123',
        templateInfo: { projects: [{ _id: 'p1' }, { _id: 'p2' }] },
        save: jest.fn().mockResolvedValue()
      };
      
      Resume.findById.mockResolvedValue(mockResume);

      await GithubController.deleteProjectFromResume(req, res);
      expect(res.statusCode).toBe(200);
      expect(mockResume.templateInfo.projects.length).toBe(1);
      expect(mockResume.templateInfo.projects[0]._id).toBe('p2');
    });
  });
});
