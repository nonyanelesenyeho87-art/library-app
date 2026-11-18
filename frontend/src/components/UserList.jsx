import { useState } from 'react';
import UserForm from './UserForm.jsx';

export default function UserList({ users, currentUserId, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  if (!users.length) return <p className="muted">No users yet.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Name</th><th>Membership ID</th><th>Role</th><th>Actions</th></tr></thead>
        <tbody>
          {users.map((u) =>
            editingId === u.id ? (
              <tr key={u.id} className="edit-row">
                <td colSpan={4}>
                  <UserForm
                    initial={u}
                    onCancel={() => setEditingId(null)}
                    onSubmit={async (values) => { await onUpdate(u.id, values); setEditingId(null); }}
                  />
                </td>
              </tr>
            ) : (
              <tr key={u.id}>
                <td data-label="Name">{u.name}</td>
                <td data-label="Membership ID">{u.membership_id}</td>
                <td data-label="Role"><span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-ok'}`}>{u.role}</span></td>
                <td data-label="Actions" className="actions">
                  <button className="btn btn-sm" onClick={() => setEditingId(u.id)}>Update</button>
                  <button className="btn btn-sm btn-danger" disabled={u.id === currentUserId} onClick={() => onDelete(u)}>Delete</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
