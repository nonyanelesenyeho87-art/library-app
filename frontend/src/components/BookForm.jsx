import { useState } from 'react';

const EMPTY = { title: '', author: '', genre: '', isbn: '', quantity: '' };

function validate(v) {
  const errors = {};
  if (!v.title.trim()) errors.title = 'Title is required';
  if (!v.author.trim()) errors.author = 'Author is required';
  if (!v.genre.trim()) errors.genre = 'Genre is required';
  if (!/^[0-9-]{10,17}$/.test(v.isbn.trim())) errors.isbn = 'ISBN must be 10–13 digits (hyphens allowed)';
  if (v.quantity === '' || !Number.isInteger(Number(v.quantity)) || Number(v.quantity) < 0) {
    errors.quantity = 'Enter a whole number, 0 or more';
  }
  return errors;
}

// Controlled form used for both adding a book and editing an existing one.
export default function BookForm({ initial, onSubmit, onCancel }) {
  const [values, setValues] = useState(initial ? { ...initial, quantity: String(initial.quantity) } : EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const editing = Boolean(initial);

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSubmitting(true);
    setServerError('');
    try {
      await onSubmit({ ...values, quantity: Number(values.quantity) });
      if (!editing) setValues(EMPTY);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name, label, props = {}) => (
    <label className="field">
      <span>{label}</span>
      <input name={name} value={values[name]} onChange={handleChange} className={errors[name] ? 'invalid' : ''} {...props} />
      {errors[name] && <em className="error-text">{errors[name]}</em>}
    </label>
  );

  return (
    <form className="form-grid" onSubmit={handleSubmit} noValidate>
      {field('title', 'Title')}
      {field('author', 'Author')}
      {field('genre', 'Genre')}
      {field('isbn', 'ISBN')}
      {field('quantity', editing ? 'Quantity in stock' : 'Initial quantity', { type: 'number', min: 0 })}
      <div className="form-actions">
        <button className="btn" disabled={submitting}>{submitting ? 'Saving…' : editing ? 'Save changes' : 'Add book'}</button>
        {onCancel && <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>}
      </div>
      {serverError && <p className="error-text span-all">{serverError}</p>}
    </form>
  );
}
