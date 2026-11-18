import { useMemo } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useFetch, useFlash } from '../hooks.js';
import Flash from '../components/Flash.jsx';
import UserForm from '../components/UserForm.jsx';
import UserList from '../components/UserList.jsx';

export default function UsersPage() {
  const { user: me } = useAuth();
  const fetchUsers = useMemo(() => api.getUsers, []);
  const { data: users, loading, error, reload } = useFetch(fetchUsers);
  const [flash, showFlash] = useFlash();

  const handleAdd = async (values) => { await api.createUser(values); showFlash('User added.'); reload(); };
  const handleUpdate = async (id, values) => { await api.updateUser(id, values); showFlash('User updated.'); reload(); };
  const handleDelete = async (u) => {
    if (!window.confirm(`Delete user "${u.name}"?`)) return;
    try { await api.deleteUser(u.id); showFlash('User deleted.'); reload(); }
    catch (e) { showFlash(e.message, 'error'); }
  };

  return (
    <>
      <h1>User Management</h1>
      <Flash flash={flash} />
      <section className="card">
        <h2>Add a new user</h2>
        <UserForm onSubmit={handleAdd} />
      </section>
      <section className="card">
        <h2>All users ({users.length})</h2>
        {loading ? <p className="muted">Loading…</p> : error ? <p className="error-text">{error}</p> : (
          <UserList users={users} currentUserId={me.id} onUpdate={handleUpdate} onDelete={handleDelete} />
        )}
      </section>
    </>
  );
}
