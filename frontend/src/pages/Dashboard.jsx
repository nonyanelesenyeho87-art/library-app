import { useMemo, useState } from 'react';
import { api } from '../api/client.js';
import { useFetch } from '../hooks.js';
import StockBadge, { LOW_STOCK_LIMIT } from '../components/StockBadge.jsx';

export default function Dashboard() {
  const fetchBooks = useMemo(() => api.getBooks, []);
  const { data: books, loading, error } = useFetch(fetchBooks);
  const [view, setView] = useState('cards');
  const [search, setSearch] = useState('');

  const filtered = books.filter((b) =>
    `${b.title} ${b.author} ${b.genre} ${b.isbn}`.toLowerCase().includes(search.toLowerCase())
  );
  const lowStock = books.filter((b) => b.quantity < LOW_STOCK_LIMIT);
  const totalCopies = books.reduce((sum, b) => sum + b.quantity, 0);

  if (loading) return <p className="muted">Loading books…</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <>
      <h1>Dashboard</h1>
      <section className="stats">
        <div className="card stat"><strong>{books.length}</strong><span>Titles</span></div>
        <div className="card stat"><strong>{totalCopies}</strong><span>Copies in stock</span></div>
        <div className={`card stat ${lowStock.length ? 'stat-warn' : ''}`}><strong>{lowStock.length}</strong><span>Low / out of stock</span></div>
      </section>

      {lowStock.length > 0 && (
        <div className="flash flash-warn">
          ⚠️ Low stock: {lowStock.map((b) => `${b.title} (${b.quantity})`).join(', ')}
        </div>
      )}

      <div className="toolbar">
        <input type="search" placeholder="Search title, author, genre, ISBN…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="toggle">
          <button className={view === 'cards' ? 'active' : ''} onClick={() => setView('cards')}>Cards</button>
          <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>Table</button>
        </div>
      </div>

      {!filtered.length && <p className="muted">No books match your search.</p>}

      {view === 'cards' ? (
        <div className="card-grid">
          {filtered.map((b) => (
            <article key={b.id} className={`card book-card ${b.quantity < LOW_STOCK_LIMIT ? 'low' : ''}`}>
              <h3>{b.title}</h3>
              <p className="muted">{b.author}</p>
              <p><span className="tag">{b.genre}</span></p>
              <div className="book-card-foot">
                <span><strong>{b.quantity}</strong> available</span>
                <StockBadge quantity={b.quantity} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        filtered.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Author</th><th>Genre</th><th>ISBN</th><th>Available</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className={b.quantity < LOW_STOCK_LIMIT ? 'row-low' : ''}>
                    <td data-label="Title">{b.title}</td>
                    <td data-label="Author">{b.author}</td>
                    <td data-label="Genre">{b.genre}</td>
                    <td data-label="ISBN">{b.isbn}</td>
                    <td data-label="Available">{b.quantity}</td>
                    <td data-label="Status"><StockBadge quantity={b.quantity} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </>
  );
}
