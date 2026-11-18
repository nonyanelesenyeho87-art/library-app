const express = require('express');
const pool = require('../db');
const { hashPassword } = require('../auth');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const COLUMNS = 'id, name, membership_id, role, created_at';

// The transaction form needs the member list, so any logged-in user may read it;
// everything that changes users is admin only.
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM users ORDER BY name`);
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /users  { name, membershipId, role, password }
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { name, membershipId, role, password } = req.body;
    if (!name?.trim() || !membershipId?.trim()) return res.status(400).json({ error: 'Name and membership ID are required.' });
    if (!['admin', 'member'].includes(role)) return res.status(400).json({ error: 'Role must be admin or member.' });
    if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    const [result] = await pool.query(
      'INSERT INTO users (name, membership_id, role, password_hash) VALUES (?, ?, ?, ?)',
      [name.trim(), membershipId.trim(), role, hashPassword(password)]
    );
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM users WHERE id = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /users/:id  { name, membershipId, role, password? }  (blank password = keep current)
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { name, membershipId, role, password } = req.body;
    if (!name?.trim() || !membershipId?.trim()) return res.status(400).json({ error: 'Name and membership ID are required.' });
    if (!['admin', 'member'].includes(role)) return res.status(400).json({ error: 'Role must be admin or member.' });
    if (password && password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    if (Number(req.params.id) === req.user.id && role !== 'admin') {
      return res.status(400).json({ error: 'You cannot remove your own admin role.' });
    }
    const fields = ['name = ?', 'membership_id = ?', 'role = ?'];
    const values = [name.trim(), membershipId.trim(), role];
    if (password) { fields.push('password_hash = ?'); values.push(hashPassword(password)); }
    const [result] = await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, [...values, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'User not found.' });
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM users WHERE id = ?`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /users/:id
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    if (Number(req.params.id) === req.user.id) return res.status(400).json({ error: 'You cannot delete your own account.' });
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'User not found.' });
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
