const request = require('supertest');
const app = require('../app');

describe('POST /a2a/SendMessage', () => {
  it('should return 202 Accepted for a valid telemetry payload', async () => {
    const payload = {
      correlationId: 'evt_123',
      sourceAgentId: 'agent_1',
      targetAgentId: 'agent_2',
      payload: { action: 'ping' },
      signature: 'valid_signature'
    };
    
    const response = await request(app).post('/a2a/SendMessage').send(payload);
    expect(response.status).toBe(202);
    expect(response.body.success).toBe(true);
  });

  it('should return 401 Unauthorized for an invalid signature (VERA integration)', async () => {
    const payload = {
      correlationId: 'evt_123',
      sourceAgentId: 'agent_1',
      targetAgentId: 'agent_2',
      payload: { action: 'ping' },
      signature: 'invalid_signature'
    };
    
    const response = await request(app).post('/a2a/SendMessage').send(payload);
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid signature');
  });

  it('should return 400 Bad Request if missing required fields', async () => {
    const payload = {
      sourceAgentId: 'agent_1'
    };
    
    const response = await request(app).post('/a2a/SendMessage').send(payload);
    expect(response.status).toBe(400);
  });

  it('should return 429 Too Many Requests if rate limit is exceeded', async () => {
    const payload = {
      correlationId: 'evt_spam',
      sourceAgentId: 'agent_spammer',
      targetAgentId: 'agent_2',
      payload: { action: 'spam' },
      signature: 'valid_signature'
    };
    
    let hitRateLimit = false;
    let rateLimitResponse;

    // Simulate spamming the endpoint
    for (let i = 0; i < 150; i++) {
      const res = await request(app).post('/a2a/SendMessage').send(payload);
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
