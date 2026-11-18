const express = require('express');
const pool = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function validate(body) {
  const { title, author, genre, isbn, quantity } = body;
  if (![title, author, genre, isbn].every((v) => typeof v === 'string' && v.trim())) {
    return 'Title, author, genre and ISBN are required.';
  }
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 0) return 'Quantity must be a whole number, 0 or more.';
  return null;
}

// GET /books
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books ORDER BY title');
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /books/:id
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Book not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /books
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ error });
    const { title, author, genre, isbn, quantity } = req.body;
    const [result] = await pool.query(
      'INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)',
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), Number(quantity)]
    );
    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /books/:id
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ error });
    const { title, author, genre, isbn, quantity } = req.body;
    const [result] = await pool.query(
      'UPDATE books SET title=?, author=?, genre=?, isbn=?, quantity=? WHERE id=?',
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), Number(quantity), req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Book not found.' });
    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /books/:id
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Book not found.' });
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
