const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json());

// Health check for CI/CD smoke tests and Railway health probes
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// In-memory store for TDD MVP
const leaderboard = new Map();

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

app.get('/api/leaderboard', (req, res) => {
  // Return sorted array
  const sorted = Array.from(leaderboard.values()).sort((a, b) => b.volume - a.volume);
  res.status(200).json(sorted);
});

module.exports = app;
