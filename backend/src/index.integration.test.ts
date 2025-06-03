import request from 'supertest';
import { app } from './index';

describe('API Integration Tests', () => {
  it('should return welcome message', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Welcome to HD Project API');
  });
}); 