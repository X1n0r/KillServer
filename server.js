'use strict';

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const path       = require('path');
const compression = require('compression');

const logger       = require('./src/middleware/logger');
const authMiddleware = require('./src/middleware/auth');
const rateLimiter  = require('./src/middleware/ratelimit');

const attacksRouter  = require('./src/routes/attacks');
const targetsRouter  = require('./src/routes/targets');
const proxiesRouter  = require('./src/routes/proxies');
const apiKeysRouter  = require('./src/routes/api-keys');
const statsRouter    = require('./src/routes/stats');
const methodsRouter  = require('./src/routes/methods');

const serverConfig = require('./config/server.config.json');

const app  = express();
const PORT = process.env.PORT || serverConfig.port || 3000;
const HOST = process.env.HOST || serverConfig.host || '0.0.0.0';

// ── Security & Parsing ────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false // disabled so the panel can load inline scripts
}));
app.use(cors({
  origin: serverConfig.allowedOrigins || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-API-Key', 'Authorization']
}));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── HTTP Request Logging ──────────────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: msg => logger.http(msg.trim()) }
}));

// ── Serve Static Panel ────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Global Rate Limiter ───────────────────────────────────────────────────────
app.use('/api/', rateLimiter);

// ── API Routes (protected by API key) ────────────────────────────────────────
app.use('/api/attacks', authMiddleware, attacksRouter);
app.use('/api/targets', authMiddleware, targetsRouter);
app.use('/api/proxies', authMiddleware, proxiesRouter);
app.use('/api/keys',    authMiddleware, apiKeysRouter);
app.use('/api/stats',   authMiddleware, statsRouter);
app.use('/api/methods', authMiddleware, methodsRouter);

// ── Health Endpoint (no auth) ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:  'online',
    version: require('./package.json').version,
    uptime:  Math.floor(process.uptime()),
    memory:  process.memoryUsage(),
    ts:      new Date().toISOString()
  });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, HOST, () => {
  logger.info(`KillServer v${require('./package.json').version} listening on http://${HOST}:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
