import { useMemo, useState } from 'react';
import { api } from '../api/client.js';
import { useFetch, useFlash } from '../hooks.js';
import BookForm from '../components/BookForm.jsx';
import BookList from '../components/BookList.jsx';
import Flash from '../components/Flash.jsx';

export default function BooksPage() {
  const fetchBooks = useMemo(() => api.getBooks, []);
  const { data: books, loading, error, reload } = useFetch(fetchBooks);
  const [flash, showFlash] = useFlash();
  const [search, setSearch] = useState('');

  const handleAdd = async (values) => {
    await api.createBook(values);
    showFlash('Book added.');
    reload();
  };
  const handleUpdate = async (id, values) => {
    await api.updateBook(id, values);
    showFlash('Book updated.');
    reload();
  };
  const handleDelete = async (book) => {
    if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    try {
      await api.deleteBook(book.id);
      showFlash('Book deleted.');
      reload();
    } catch (e) { showFlash(e.message, 'error'); }
  };

  const filtered = books.filter((b) => `${b.title} ${b.author} ${b.genre}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <h1>Book Management</h1>
      <Flash flash={flash} />
      <section className="card">
        <h2>Add a new book</h2>
        <BookForm onSubmit={handleAdd} />
      </section>
      <section className="card">
        <div className="section-head">
          <h2>All books ({books.length})</h2>
          <input type="search" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {loading ? <p className="muted">Loading…</p> : error ? <p className="error-text">{error}</p> : (
          <BookList books={filtered} onUpdate={handleUpdate} onDelete={handleDelete} />
        )}
      </section>
    </>
  );
}
