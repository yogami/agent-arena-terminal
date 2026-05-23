const express = require('express');
const router = express.Router();
const { leaderboard } = require('../store');

router.get('/', (_req, res) => {
  const sorted = Array.from(leaderboard.values()).sort((a, b) => b.volume - a.volume);
  res.status(200).json(sorted);
});

module.exports = router;
