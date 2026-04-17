const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error({ message: err.message, stack: err.stack, path: req.path });

  if (err.code === '23505') {
    return res.status(409).json({ error: 'Conflict', message: 'A record with this value already exists.' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Bad Request', message: 'Referenced resource does not exist.' });
  }

  const status = err.status || 500;
  res.status(status).json({
    error: err.name || 'Internal Server Error',
    message: status === 500 ? 'An unexpected error occurred.' : err.message,
  });
};

const notFound = (req, res) => {
  res.status(404).json({ error: 'Not Found', message: `Route ${req.method} ${req.path} not found` });
};

module.exports = { errorHandler, notFound };
