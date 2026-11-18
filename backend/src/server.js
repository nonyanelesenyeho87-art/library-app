const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const transactionRoutes = require('./routes/transactions');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'Library API running' }));
app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
app.use('/transactions', transactionRoutes);
app.use('/users', userRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));

// Central error handler: turns common MySQL errors into friendly messages.
app.use((err, req, res, next) => {
  if (err.code === 'ER_DUP_ENTRY') {
    const field = /isbn/i.test(err.message) ? 'ISBN' : /membership/i.test(err.message) ? 'Membership ID' : 'value';
    return res.status(409).json({ error: `That ${field} already exists.` });
  }
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    return res.status(400).json({ error: 'Quantity cannot be negative.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
