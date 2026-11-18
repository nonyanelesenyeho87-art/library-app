const express = require('express');
const pool = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /transactions  - full history, newest first
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM transactions ORDER BY created_at DESC, id DESC LIMIT 500');
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /transactions  { bookId, type: 'add_stock'|'borrow'|'return', quantity, userId? }
// Stock is changed and the record written inside one DB transaction.
router.post('/', async (req, res, next) => {
  const { bookId, type } = req.body;
  const quantity = Number(req.body.quantity);

  if (!['add_stock', 'borrow', 'return'].includes(type)) {
    return res.status(400).json({ error: 'Type must be add_stock, borrow or return.' });
  }
  if (!bookId) return res.status(400).json({ error: 'Please choose a book.' });
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be a whole number of at least 1.' });
  }
  // Only admins may add stock or record on behalf of another member.
  const isAdmin = req.user.role === 'admin';
  if (type === 'add_stock' && !isAdmin) return res.status(403).json({ error: 'Only admins can add stock.' });
  const actingUserId = isAdmin && req.body.userId ? Number(req.body.userId) : req.user.id;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [books] = await conn.query('SELECT * FROM books WHERE id = ? FOR UPDATE', [bookId]);
    const [users] = await conn.query('SELECT id, name FROM users WHERE id = ?', [actingUserId]);
    if (!books.length) { await conn.rollback(); return res.status(404).json({ error: 'Book not found.' }); }
    if (!users.length) { await conn.rollback(); return res.status(404).json({ error: 'User not found.' }); }

    const book = books[0];
    const delta = type === 'borrow' ? -quantity : quantity;
    if (book.quantity + delta < 0) {
      await conn.rollback();
      return res.status(409).json({ error: `Only ${book.quantity} cop${book.quantity === 1 ? 'y' : 'ies'} of "${book.title}" in stock.` });
    }

    await conn.query('UPDATE books SET quantity = quantity + ? WHERE id = ?', [delta, book.id]);
    const [result] = await conn.query(
      'INSERT INTO transactions (book_id, user_id, book_title, user_name, type, quantity) VALUES (?, ?, ?, ?, ?, ?)',
      [book.id, users[0].id, book.title, users[0].name, type, quantity]
    );
    await conn.commit();

    const [tx] = await pool.query('SELECT * FROM transactions WHERE id = ?', [result.insertId]);
    const [updated] = await pool.query('SELECT * FROM books WHERE id = ?', [book.id]);
    res.status(201).json({ transaction: tx[0], book: updated[0] });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

// DELETE /transactions/:id  - admin clean-up of a log entry (does not change stock)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Transaction not found.' });
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
