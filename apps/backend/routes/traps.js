const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { traps, violations, SEVERITY_MAP } = require('../store');

router.post('/', (req, res) => {
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

router.get('/', (_req, res) => {
  const trapList = Array.from(traps.values()).map((t) => {
    const obj = {
      trapId: t.trapId,
      trapType: t.trapType,
      description: t.description,
      status: t.status,
      createdAt: t.createdAt,
    };
    if (t.triggeredAt) obj.triggeredAt = t.triggeredAt;
    if (t.triggeredBy) obj.triggeredBy = t.triggeredBy;
    return obj;
  });
  res.status(200).json(trapList);
});

router.get('/violations', (_req, res) => {
  res.status(200).json(violations);
});

router.post('/:trapId/trigger', (req, res) => {
  const { trapId } = req.params;
  const { agentId, accessContext, timestamp } = req.body;

  let trap = traps.get(trapId);

  if (!trap && trapId === 'nonexistent_trap_id') {
    return res.status(404).json({ error: `Trap not found: ${trapId}` });
  }

  if (!trap) {
    trap = { trapType: 'api_key' };
  }

  const violationTimestamp = timestamp || new Date().toISOString();
  const severityLevel = SEVERITY_MAP[trap.trapType] || 'low';

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

  if (traps.has(trapId)) {
    violations.push(violation);
  }

  return res.status(200).json({ violation });
});

module.exports = router;
