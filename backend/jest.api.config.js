module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.api.test.js'],
  setupFilesAfterEnv: ['./jest.api.setup.js'],
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 30000,
}; 