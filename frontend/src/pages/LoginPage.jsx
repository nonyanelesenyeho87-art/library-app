import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ membershipId: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!values.membershipId.trim() || !values.password) return setError('Enter your membership ID and password.');
    setError('');
    setLoading(true);
    try {
      await login(values.membershipId, values.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="card login-card" onSubmit={handleSubmit} noValidate>
        <h1>📚 Library Manager</h1>
        <p className="muted">Sign in with your membership ID</p>
        <label className="field">
          <span>Membership ID</span>
          <input name="membershipId" value={values.membershipId} onChange={handleChange} autoFocus autoComplete="username" />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" name="password" value={values.password} onChange={handleChange} autoComplete="current-password" />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-block" disabled={loading}>{loading ? 'Signing in…' : 'Log in'}</button>
        <p className="muted hint">Demo: <code>ADMIN001</code> / <code>admin123</code></p>
      </form>
    </div>
  );
}
