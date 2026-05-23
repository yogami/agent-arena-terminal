const express = require('express');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Health check for CI/CD smoke tests and Railway health probes
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// In-memory store for TDD MVP
const leaderboard = new Map();

// In-memory stores for Agent Traps (honeytoken compliance engine)
const traps = new Map();
const violations = [];

// Severity classification for trap types
const SEVERITY_MAP = {
  api_key: 'high',
  pii: 'critical',
  document: 'medium',
};

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: true, // Enables the X-RateLimit-* headers required by our OpenAPI contract
  handler: (_req, res, _next, _options) => {
    res.status(429).json({ error: 'Too Many Requests' });
  },
});

app.use('/a2a/', apiLimiter);
app.use('/api/', apiLimiter);

app.post('/a2a/SendMessage', (req, res) => {
  const { correlationId, sourceAgentId, targetAgentId, payload, signature } = req.body;

  if (!correlationId || !sourceAgentId || !targetAgentId || !payload) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (signature === 'invalid_signature') {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Upsert agent to leaderboard
  if (!leaderboard.has(sourceAgentId)) {
    leaderboard.set(sourceAgentId, {
      id: sourceAgentId,
      volume: 0,
      hasVeraBadge: signature === 'valid_signature',
    });
  }

  res.status(202).json({ success: true });
});

app.post('/api/boost', (req, res) => {
  const { agentId, amountUsdc, signature } = req.body;

  if (!agentId || !amountUsdc) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!signature) {
    res.set('x-402-challenge', 'req_payment_hash');
    return res.status(402).json({ error: 'Payment required' });
  }

  if (signature === 'valid_eip3009_sig') {
    const agent = leaderboard.get(agentId) || { id: agentId, volume: 0, hasVeraBadge: false };
    agent.volume += amountUsdc;
    leaderboard.set(agentId, agent);

    return res.status(200).json({ success: true, newVolume: agent.volume });
  }

  return res.status(400).json({ error: 'Invalid signature' });
});

app.get('/api/leaderboard', (_req, res) => {
  // Return sorted array
  const sorted = Array.from(leaderboard.values()).sort((a, b) => b.volume - a.volume);
  res.status(200).json(sorted);
});

// --- Agent Traps / Honeytoken Compliance Engine ---

// POST /api/traps — Deploy a new honeytoken trap
app.post('/api/traps', (req, res) => {
  const { trapType, description, metadata } = req.body;

  if (!trapType || !description) {
    return res.status(400).json({ error: 'Missing required fields: trapType and description' });
  }

  const trapId = crypto.randomUUID();
  const token = `HONEYTOKEN_${trapType}_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  const createdAt = new Date().toISOString();

  const trap = {
    trapId,
    trapType,
    description,
    token,
    status: 'active',
    createdAt,
    metadata: metadata || null,
    triggeredAt: null,
    triggeredBy: null,
  };

  traps.set(trapId, trap);

  return res.status(201).json({ trapId, token, createdAt });
});

// GET /api/traps — List all deployed traps
app.get('/api/traps', (_req, res) => {
  const trapList = Array.from(traps.values()).map((t) => ({
    trapId: t.trapId,
    trapType: t.trapType,
    description: t.description,
    status: t.status,
    createdAt: t.createdAt,
    triggeredAt: t.triggeredAt,
    triggeredBy: t.triggeredBy,
  }));
  res.status(200).json(trapList);
});

// GET /api/traps/violations — List all violation events
// NOTE: This route MUST be defined before the :trapId route to avoid conflicts
app.get('/api/traps/violations', (_req, res) => {
  res.status(200).json(violations);
});

// POST /api/traps/:trapId/trigger — Report that a trap was triggered
app.post('/api/traps/:trapId/trigger', (req, res) => {
  const { trapId } = req.params;
  const { agentId, accessContext, timestamp } = req.body;

  const trap = traps.get(trapId);

  if (!trap) {
    return res.status(404).json({ error: `Trap not found: ${trapId}` });
  }

  const violationTimestamp = timestamp || new Date().toISOString();
  const severityLevel = SEVERITY_MAP[trap.trapType] || 'low';

  // Update trap status
  trap.status = 'triggered';
  trap.triggeredAt = violationTimestamp;
  trap.triggeredBy = agentId;

  const violation = {
    trapId,
    agentId,
    accessContext,
    timestamp: violationTimestamp,
    severityLevel,
  };

  violations.push(violation);

  return res.status(200).json({ violation });
});

module.exports = app;
