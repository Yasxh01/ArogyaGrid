function errorHandler(err, req, res, next) {
  console.error('[Error]', err.stack || err.message || err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'SERVER_ERROR',
    timestamp: new Date().toISOString()
  });
}

module.exports = errorHandler;
