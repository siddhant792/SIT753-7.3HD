import request from 'supertest';
import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to HD Project API' });
});

describe('API', () => {
  it('should return welcome message', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
  });
}); 