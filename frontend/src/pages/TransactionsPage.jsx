import { useMemo } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useFetch, useFlash } from '../hooks.js';
import Flash from '../components/Flash.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import TransactionLog from '../components/TransactionLog.jsx';

export default function TransactionsPage() {
  const { isAdmin } = useAuth();
  const fetchBooks = useMemo(() => api.getBooks, []);
  const fetchTx = useMemo(() => api.getTransactions, []);
  const fetchUsers = useMemo(() => api.getUsers, []);
  const books = useFetch(fetchBooks);
  const tx = useFetch(fetchTx);
  const users = useFetch(fetchUsers);
  const [flash, showFlash] = useFlash();

  const handleSubmit = async (payload) => {
    const { book } = await api.createTransaction(payload);
    showFlash(`Recorded. "${book.title}" now has ${book.quantity} in stock.`);
    books.reload();
    tx.reload();
  };

  return (
    <>
      <h1>Transactions</h1>
      <Flash flash={flash} />
      <section className="card">
        <h2>Record a transaction</h2>
        <TransactionForm books={books.data} users={isAdmin ? users.data : []} onSubmit={handleSubmit} />
      </section>
      <section className="card">
        <h2>Transaction history</h2>
        {tx.loading ? <p className="muted">Loading…</p> : tx.error ? <p className="error-text">{tx.error}</p> : (
          <TransactionLog transactions={tx.data} />
        )}
      </section>
    </>
  );
}
