const express = require('express');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

const app = express();
const helmet = require('helmet');

app.use(helmet());
app.use(express.json());

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: true,
  handler: (_req, res, _next, _options) => {
    res.status(429).json({ error: 'Too Many Requests' });
  },
});

app.use('/a2a', apiLimiter);
app.use('/api', apiLimiter);

const healthRoutes = require('./routes/health');
const a2aRoutes = require('./routes/a2a');
const boostRoutes = require('./routes/boost');
const leaderboardRoutes = require('./routes/leaderboard');
const trapsRoutes = require('./routes/traps');

// Mount routes
app.use('/health', healthRoutes);
app.use('/a2a', a2aRoutes);
app.use('/api/boost', boostRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/traps', trapsRoutes);

module.exports = app;
