import { useState } from 'react';

const EMPTY = { name: '', membershipId: '', role: 'member', password: '' };

// Controlled form for adding or editing a user. When editing, a blank password keeps the old one.
export default function UserForm({ initial, onSubmit, onCancel }) {
  const editing = Boolean(initial);
  const [values, setValues] = useState(
    initial ? { name: initial.name, membershipId: initial.membership_id, role: initial.role, password: '' } : EMPTY
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!values.name.trim()) found.name = 'Name is required';
    if (!values.membershipId.trim()) found.membershipId = 'Membership ID is required';
    if (!editing && values.password.length < 6) found.password = 'Password must be at least 6 characters';
    if (editing && values.password && values.password.length < 6) found.password = 'Password must be at least 6 characters';
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    setServerError('');
    try {
      await onSubmit(values);
      if (!editing) setValues(EMPTY);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span>Full name</span>
        <input name="name" value={values.name} onChange={handleChange} className={errors.name ? 'invalid' : ''} />
        {errors.name && <em className="error-text">{errors.name}</em>}
      </label>
      <label className="field">
        <span>Membership ID</span>
        <input name="membershipId" value={values.membershipId} onChange={handleChange} className={errors.membershipId ? 'invalid' : ''} />
        {errors.membershipId && <em className="error-text">{errors.membershipId}</em>}
      </label>
      <label className="field">
        <span>Role</span>
        <select name="role" value={values.role} onChange={handleChange}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <label className="field">
        <span>{editing ? 'New password (optional)' : 'Password'}</span>
        <input type="password" name="password" value={values.password} onChange={handleChange} autoComplete="new-password" className={errors.password ? 'invalid' : ''} />
        {errors.password && <em className="error-text">{errors.password}</em>}
      </label>
      <div className="form-actions">
        <button className="btn" disabled={submitting}>{submitting ? 'Saving…' : editing ? 'Save changes' : 'Add user'}</button>
        {onCancel && <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>}
      </div>
      {serverError && <p className="error-text span-all">{serverError}</p>}
    </form>
  );
}
