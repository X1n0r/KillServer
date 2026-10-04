'use strict';

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    methods: [
      { id: 'http-flood', name: 'HTTP Flood', description: 'Layer 7 HTTP requests' },
      { id: 'tcp-flood', name: 'TCP Flood', description: 'Layer 4 TCP connections' },
      { id: 'udp-flood', name: 'UDP Flood', description: 'Layer 4 UDP packets' }
    ]
  });
});

module.exports = router;
