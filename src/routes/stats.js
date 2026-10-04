'use strict';

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    totalAttacks: 0,
    activeAttacks: 0
  });
});

module.exports = router;
