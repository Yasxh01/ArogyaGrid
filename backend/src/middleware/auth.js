const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required', code: 'UNAUTHORIZED' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token', code: 'FORBIDDEN' });
    }
    req.user = user;
    next();
  });
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Action requires one of roles: [${allowedRoles.join(', ')}]`,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };
