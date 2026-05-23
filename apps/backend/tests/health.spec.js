const request = require('supertest');
const app = require('../app');

describe('GET /health', () => {
  it('should return 200 with status ok and a timestamp', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();

    // Verify timestamp is valid ISO 8601
    const parsed = new Date(response.body.timestamp);
    expect(parsed.toISOString()).toBe(response.body.timestamp);
  });
});
