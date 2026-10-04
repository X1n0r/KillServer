'use strict';

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ targets: [] });
});

router.post('/', (req, res) => {
  res.json({ status: 'created', id: 'target-id' });
});

module.exports = router;
