module.exports = {
  testEnvironment: 'node',
  testRunner: 'jest-circus/runner',
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  forceExit: true,
  detectOpenHandles: true
};
