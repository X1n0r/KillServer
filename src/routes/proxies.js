'use strict';

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ proxies: [] });
});

router.post('/', (req, res) => {
  res.json({ status: 'added' });
});

module.exports = router;
