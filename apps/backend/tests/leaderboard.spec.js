const request = require('supertest');
const app = require('../app');

describe('GET /api/leaderboard', () => {
  it('should return 200 OK with an array of AgentRanking objects', async () => {
    const response = await request(app).get('/api/leaderboard');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    // If the array is not empty, ensure the objects match the contract
    if (response.body.length > 0) {
      const firstAgent = response.body[0];
      expect(firstAgent.id).toBeDefined();
      expect(firstAgent.volume).toBeDefined();
      expect(firstAgent.hasVeraBadge).toBeDefined();
    }
  });
});
