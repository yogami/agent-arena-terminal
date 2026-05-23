const request = require('supertest');
const app = require('../app');

describe('POST /api/boost', () => {
  it('should return 402 Payment Required with x-402-challenge header if no signature is provided', async () => {
    const payload = {
      agentId: 'agent_123',
      amountUsdc: 0.05,
    };

    const response = await request(app).post('/api/boost').send(payload);
    expect(response.status).toBe(402);
    expect(response.headers['x-402-challenge']).toBeDefined();
    expect(response.body.error).toBeDefined();
  });

  it('should return 200 OK and update volume if a valid EIP-3009 signature is provided', async () => {
    const payload = {
      agentId: 'agent_123',
      amountUsdc: 0.05,
      signature: 'valid_eip3009_sig',
    };

    const response = await request(app).post('/api/boost').send(payload);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.newVolume).toBeDefined();
  });

  it('should return 429 Too Many Requests if rate limit is exceeded', async () => {
    const payload = {
      agentId: 'agent_spammer',
      amountUsdc: 0.05,
    };

    let hitRateLimit = false;
    let rateLimitResponse;

    for (let i = 0; i < 150; i++) {
      const res = await request(app).post('/api/boost').send(payload);
      if (res.status === 429) {
        hitRateLimit = true;
        rateLimitResponse = res;
        break;
      }
    }

    expect(hitRateLimit).toBe(true);
    expect(rateLimitResponse.headers['x-ratelimit-limit']).toBeDefined();
  });
});
