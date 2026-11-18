import { useState } from 'react';
import BookForm from './BookForm.jsx';
import StockBadge from './StockBadge.jsx';

// Editable list of books. Clicking "Update" turns that row into an edit form.
export default function BookList({ books, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);

  if (!books.length) return <p className="muted">No books found.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Title</th><th>Author</th><th>Genre</th><th>ISBN</th><th>Qty</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {books.map((b) =>
            editingId === b.id ? (
              <tr key={b.id} className="edit-row">
                <td colSpan={7}>
                  <BookForm
                    initial={b}
                    onCancel={() => setEditingId(null)}
                    onSubmit={async (values) => { await onUpdate(b.id, values); setEditingId(null); }}
                  />
                </td>
              </tr>
            ) : (
              <tr key={b.id}>
                <td data-label="Title">{b.title}</td>
                <td data-label="Author">{b.author}</td>
                <td data-label="Genre">{b.genre}</td>
                <td data-label="ISBN">{b.isbn}</td>
                <td data-label="Qty">{b.quantity}</td>
                <td data-label="Status"><StockBadge quantity={b.quantity} /></td>
                <td data-label="Actions" className="actions">
                  <button className="btn btn-sm" onClick={() => setEditingId(b.id)}>Update</button>
                  <button className="btn btn-sm btn-danger" onClick={() => onDelete(b)}>Delete</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
