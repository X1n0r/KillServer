'use strict';

const logger = require('./logger');

function authMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization'];
  
  if (!apiKey) {
    logger.warn(`Unauthorized access attempt from ${req.ip}`);
    return res.status(401).json({ error: 'API key required' });
  }
  
  // Add your API key validation logic here
  // For now, we'll accept any non-empty key
  req.apiKey = apiKey;
  next();
}

module.exports = authMiddleware;
