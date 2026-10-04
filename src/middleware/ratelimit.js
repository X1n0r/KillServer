'use strict';

const rateLimit = require('express-rate-limit');
const logger = require('./logger');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests' },
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for ${req.ip}`);
    res.status(429).json({ error: 'Too many requests' });
  }
});

module.exports = rateLimiter;
