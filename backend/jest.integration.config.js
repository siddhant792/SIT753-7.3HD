module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  testMatch: ['**/*.integration.test.ts'],
  moduleFileExtensions: ['ts', 'js']
}; 