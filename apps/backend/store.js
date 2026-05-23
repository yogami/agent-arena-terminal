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

module.exports = {
  leaderboard,
  traps,
  violations,
  SEVERITY_MAP,
};
