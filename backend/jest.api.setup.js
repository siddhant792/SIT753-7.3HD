// Increase timeout for all tests
jest.setTimeout(30000);

// Global setup before all tests
beforeAll(async () => {
  // Add any global setup here
  // For example, starting a test server or setting up test database
});

// Global cleanup after all tests
afterAll(async () => {
  // Add any global cleanup here
  // For example, stopping the test server or cleaning up test database
});

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
}); 