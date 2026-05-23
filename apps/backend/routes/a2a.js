const express = require('express');
const router = express.Router();
const { leaderboard } = require('../store');

router.post('/SendMessage', (req, res) => {
  const { correlationId, sourceAgentId, targetAgentId, payload, signature } = req.body;

  if (!correlationId || !sourceAgentId || !targetAgentId || !payload) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (signature === 'invalid_signature') {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  if (!leaderboard.has(sourceAgentId)) {
    leaderboard.set(sourceAgentId, {
      id: sourceAgentId,
      volume: 0,
      hasVeraBadge: signature === 'valid_signature',
    });
  }

  res.status(202).json({ success: true });
});

module.exports = router;
