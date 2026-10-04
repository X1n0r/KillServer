'use strict';

const express = require('express');
const router = express.Router();
const logger = require('../middleware/logger');

router.get('/', (req, res) => {
  res.json({ attacks: [] });
});

router.post('/', (req, res) => {
  logger.info('Attack initiated');
  res.json({ status: 'pending', id: 'attack-id' });
});

module.exports = router;
