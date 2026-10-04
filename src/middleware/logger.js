'use strict';

const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs   = require('fs');

const logDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const { combine, timestamp, printf, colorize, errors } = format;

const consoleFmt = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp}  ${level.padEnd(7)}  ${stack || message}`;
});

const fileFmt = printf(({ level, message, timestamp, stack }) => {
  return JSON.stringify({ ts: timestamp, level, message: stack || message });
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(errors({ stack: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })),
  transports: [
    new transports.Console({
      format: combine(colorize(), consoleFmt)
    }),
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level:    'error',
      format:   fileFmt,
      maxsize:  20 * 1024 * 1024,
      maxFiles: 5
    }),
    new transports.File({
      filename: path.join(logDir, 'combined.log'),
      format:   fileFmt,
      maxsize:  20 * 1024 * 1024,
      maxFiles: 14
    })
  ]
});

// Separate attacks log
logger.attackLog = createLogger({
  level: 'info',
  format: combine(timestamp(), fileFmt),
  transports: [
    new transports.File({
      filename: path.join(logDir, 'attacks.log'),
      maxsize:  20 * 1024 * 1024,
      maxFiles: 30
    })
  ]
});

module.exports = logger;
