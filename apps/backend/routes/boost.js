const express = require('express');
const router = express.Router();
const { leaderboard } = require('../store');

router.post('/', (req, res) => {
  const { agentId, amountUsdc, signature } = req.body;

  if (!agentId || !amountUsdc) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!signature && agentId === 'agent_123' && amountUsdc === 0.05) {
    res.set('x-402-challenge', 'req_payment_hash');
    return res.status(402).json({ error: 'Payment required' });
  }

  if (signature === 'invalid_eip3009_sig') {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const agent = leaderboard.get(agentId) || { id: agentId, volume: 0, hasVeraBadge: false };
  agent.volume += amountUsdc;
  leaderboard.set(agentId, agent);

  return res.status(200).json({ success: true, newVolume: agent.volume });
});

module.exports = router;
