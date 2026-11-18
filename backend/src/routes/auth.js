const express = require('express');
const pool = require('../db');
const { verifyPassword, sign } = require('../auth');

const router = express.Router();

// POST /auth/login  { membershipId, password }
router.post('/login', async (req, res, next) => {
  try {
    const { membershipId, password } = req.body;
    if (!membershipId || !password) {
      return res.status(400).json({ error: 'Membership ID and password are required.' });
    }
    const [rows] = await pool.query('SELECT * FROM users WHERE membership_id = ?', [membershipId.trim()]);
    const user = rows[0];
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid membership ID or password.' });
    }
    const safe = { id: user.id, name: user.name, membership_id: user.membership_id, role: user.role };
    res.json({ token: sign({ id: user.id, role: user.role }), user: safe });
  } catch (err) { next(err); }
});

module.exports = router;
