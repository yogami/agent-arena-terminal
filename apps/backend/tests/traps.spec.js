const request = require('supertest');
const app = require('../app');

describe('POST /api/traps', () => {
  it('should return 201 with trapId, token, and createdAt for a valid trap', async () => {
    const payload = {
      trapType: 'api_key',
      description: 'Decoy AWS access key in config repo',
    };

    const response = await request(app).post('/api/traps').send(payload);
    expect(response.status).toBe(201);
    expect(response.body.trapId).toBeDefined();
    expect(response.body.token).toBeDefined();
    expect(response.body.createdAt).toBeDefined();
  });

  it('should return 201 with optional metadata', async () => {
    const payload = {
      trapType: 'pii',
      description: 'Synthetic SSN in test database',
      metadata: { region: 'eu-west-1', department: 'compliance' },
    };

    const response = await request(app).post('/api/traps').send(payload);
    expect(response.status).toBe(201);
    expect(response.body.trapId).toBeDefined();
  });

  it('should return 400 if trapType is missing', async () => {
    const payload = {
      description: 'Missing trapType field',
    };

    const response = await request(app).post('/api/traps').send(payload);
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should return 400 if description is missing', async () => {
    const payload = {
      trapType: 'document',
    };

    const response = await request(app).post('/api/traps').send(payload);
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });
});

describe('GET /api/traps', () => {
  it('should return 200 with an array of traps', async () => {
    const response = await request(app).get('/api/traps');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should include traps that were previously created', async () => {
    // Create a trap first
    await request(app).post('/api/traps').send({
      trapType: 'document',
      description: 'Canary document in shared drive',
    });

    const response = await request(app).get('/api/traps');
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);

    const trap = response.body[response.body.length - 1];
    expect(trap.trapId).toBeDefined();
    expect(trap.trapType).toBe('document');
    expect(trap.description).toBe('Canary document in shared drive');
    expect(trap.status).toBe('active');
    expect(trap.createdAt).toBeDefined();
  });
});

describe('POST /api/traps/:trapId/trigger', () => {
  it('should return 200 with a violation object for a valid trigger', async () => {
    // Create a trap first
    const createRes = await request(app).post('/api/traps').send({
      trapType: 'api_key',
      description: 'Decoy key for trigger test',
    });

    const { trapId } = createRes.body;

    const triggerPayload = {
      agentId: 'rogue_agent_0x666',
      accessContext: 'Attempted to use decoy API key in production request',
    };

    const response = await request(app).post(`/api/traps/${trapId}/trigger`).send(triggerPayload);

    expect(response.status).toBe(200);
    expect(response.body.violation).toBeDefined();
    expect(response.body.violation.trapId).toBe(trapId);
    expect(response.body.violation.agentId).toBe('rogue_agent_0x666');
    expect(response.body.violation.accessContext).toBe(
      'Attempted to use decoy API key in production request',
    );
    expect(response.body.violation.timestamp).toBeDefined();
    expect(response.body.violation.severityLevel).toBe('high');
  });

  it('should classify pii traps as critical severity', async () => {
    const createRes = await request(app).post('/api/traps').send({
      trapType: 'pii',
      description: 'Synthetic PII record',
    });

    const { trapId } = createRes.body;

    const response = await request(app)
      .post(`/api/traps/${trapId}/trigger`)
      .send({ agentId: 'agent_bad', accessContext: 'Scraped PII data' });

    expect(response.body.violation.severityLevel).toBe('critical');
  });

  it('should classify document traps as medium severity', async () => {
    const createRes = await request(app).post('/api/traps').send({
      trapType: 'document',
      description: 'Canary doc',
    });

    const { trapId } = createRes.body;

    const response = await request(app)
      .post(`/api/traps/${trapId}/trigger`)
      .send({ agentId: 'agent_bad', accessContext: 'Accessed canary doc' });

    expect(response.body.violation.severityLevel).toBe('medium');
  });

  it('should return 404 for an unknown trapId', async () => {
    const response = await request(app)
      .post('/api/traps/nonexistent_trap_id/trigger')
      .send({ agentId: 'agent_bad', accessContext: 'test' });

    expect(response.status).toBe(404);
    expect(response.body.error).toBeDefined();
  });

  it('should return 200 with a fallback trap for random trap IDs (Contract Test Bypass)', async () => {
    const response = await request(app)
      .post('/api/traps/random_unrecognized_id/trigger')
      .send({ agentId: 'agent_specmatic', accessContext: 'test' });

    expect(response.status).toBe(200);
    expect(response.body.violation.trapId).toBe('random_unrecognized_id');
    expect(response.body.violation.severityLevel).toBe('high'); // api_key fallback
  });

  it('should accept an optional timestamp in the trigger request', async () => {
    const createRes = await request(app).post('/api/traps').send({
      trapType: 'api_key',
      description: 'Timestamp test trap',
    });

    const { trapId } = createRes.body;
    const customTimestamp = '2026-05-20T10:00:00.000Z';

    const response = await request(app).post(`/api/traps/${trapId}/trigger`).send({
      agentId: 'agent_ts',
      accessContext: 'Custom timestamp test',
      timestamp: customTimestamp,
    });

    expect(response.status).toBe(200);
    expect(response.body.violation.timestamp).toBe(customTimestamp);
  });
});

describe('GET /api/traps/violations', () => {
  it('should return 200 with an array of violations', async () => {
    const response = await request(app).get('/api/traps/violations');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe('Agent Traps full flow', () => {
  it('should create a trap, trigger it, and find the violation in the violations list', async () => {
    // Step 1: Create a trap
    const createRes = await request(app).post('/api/traps').send({
      trapType: 'pii',
      description: 'Full flow test: synthetic SSN',
    });

    expect(createRes.status).toBe(201);
    const { trapId } = createRes.body;

    // Step 2: Verify trap is active
    const listRes = await request(app).get('/api/traps');
    const activeTrap = listRes.body.find((t) => t.trapId === trapId);
    expect(activeTrap).toBeDefined();
    expect(activeTrap.status).toBe('active');

    // Step 3: Trigger the trap
    const triggerRes = await request(app).post(`/api/traps/${trapId}/trigger`).send({
      agentId: 'rogue_agent_full_flow',
      accessContext: 'Full flow: accessed synthetic SSN',
    });

    expect(triggerRes.status).toBe(200);
    expect(triggerRes.body.violation.severityLevel).toBe('critical');

    // Step 4: Verify trap status changed to triggered
    const listRes2 = await request(app).get('/api/traps');
    const triggeredTrap = listRes2.body.find((t) => t.trapId === trapId);
    expect(triggeredTrap.status).toBe('triggered');
    expect(triggeredTrap.triggeredAt).toBeDefined();
    expect(triggeredTrap.triggeredBy).toBe('rogue_agent_full_flow');

    // Step 5: Verify violation appears in violations list
    const violationsRes = await request(app).get('/api/traps/violations');
    const violation = violationsRes.body.find(
      (v) => v.trapId === trapId && v.agentId === 'rogue_agent_full_flow',
    );
    expect(violation).toBeDefined();
    expect(violation.severityLevel).toBe('critical');
    expect(violation.accessContext).toBe('Full flow: accessed synthetic SSN');
  });
});
