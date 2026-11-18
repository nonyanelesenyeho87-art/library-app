import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    { to: '/', label: 'Dashboard', end: true },
    ...(isAdmin ? [{ to: '/books', label: 'Books' }] : []),
    { to: '/transactions', label: 'Transactions' },
    ...(isAdmin ? [{ to: '/users', label: 'Users' }] : []),
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <span className="brand">📚 Library Manager</span>
        <button className="menu-toggle" aria-label="Toggle menu" onClick={() => setOpen((o) => !o)}>☰</button>
        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)}>{l.label}</NavLink>
          ))}
          <span className="nav-user">{user.name} <small>({user.role})</small></span>
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>Log out</button>
        </nav>
      </div>
    </header>
  );
}
