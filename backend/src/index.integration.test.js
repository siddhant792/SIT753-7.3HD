import request from 'supertest'
const app = require('./index')

describe('Integration Tests', () => {
  test('should respond to health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect('Content-Type', /json/)
      .expect(200)

    expect(response.body.status).toBe('ok')
  })
}) 