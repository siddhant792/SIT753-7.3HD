export default {
  testEnvironment: 'node',
  testMatch: ['**/*.integration.test.js'],
  moduleFileExtensions: ['js'],
  transform: {},
  extensionsToTreatAsEsm: ['.js'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'test-results', outputName: 'junit.xml' }]
  ]
}; 