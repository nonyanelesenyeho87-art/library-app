const { verify } = require('../auth');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const payload = verify(header.replace(/^Bearer /, ''));
  if (!payload) return res.status(401).json({ error: 'Please log in to continue.' });
  req.user = payload;
  next();
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
  next();
}

module.exports = { requireAuth, requireAdmin };
