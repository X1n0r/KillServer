'use strict';

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ keys: [] });
});

router.post('/', (req, res) => {
  res.json({ status: 'created', key: 'new-api-key' });
});

module.exports = router;
