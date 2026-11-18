import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

// Form to add stock / borrow / return. Members can only borrow or return for themselves.
export default function TransactionForm({ books, users, onSubmit }) {
  const { isAdmin, user } = useAuth();
  const [values, setValues] = useState({ bookId: '', type: 'borrow', quantity: '1', userId: String(user.id) });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!values.bookId) return setError('Please choose a book.');
    if (!Number.isInteger(Number(values.quantity)) || Number(values.quantity) < 1) return setError('Quantity must be at least 1.');
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        bookId: Number(values.bookId),
        type: values.type,
        quantity: Number(values.quantity),
        userId: isAdmin ? Number(values.userId) : undefined,
      });
      setValues((v) => ({ ...v, quantity: '1' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span>Action</span>
        <select name="type" value={values.type} onChange={handleChange}>
          <option value="borrow">Borrow (deduct stock)</option>
          <option value="return">Return (add back)</option>
          {isAdmin && <option value="add_stock">Add new stock</option>}
        </select>
      </label>
      <label className="field">
        <span>Book</span>
        <select name="bookId" value={values.bookId} onChange={handleChange}>
          <option value="">— choose a book —</option>
          {books.map((b) => <option key={b.id} value={b.id}>{b.title} ({b.quantity} in stock)</option>)}
        </select>
      </label>
      {isAdmin && (
        <label className="field">
          <span>Member</span>
          <select name="userId" value={values.userId} onChange={handleChange}>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.membership_id})</option>)}
          </select>
        </label>
      )}
      <label className="field">
        <span>Quantity</span>
        <input type="number" min="1" name="quantity" value={values.quantity} onChange={handleChange} />
      </label>
      <div className="form-actions">
        <button className="btn" disabled={submitting}>{submitting ? 'Saving…' : 'Record transaction'}</button>
      </div>
      {error && <p className="error-text span-all">{error}</p>}
    </form>
  );
}
