const LABELS = { add_stock: 'Stock added', borrow: 'Borrowed', return: 'Returned' };

export default function TransactionLog({ transactions }) {
  if (!transactions.length) return <p className="muted">No transactions recorded yet.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Date</th><th>Book</th><th>Member</th><th>Type</th><th>Qty</th></tr></thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td data-label="Date">{new Date(t.created_at).toLocaleString()}</td>
              <td data-label="Book">{t.book_title}</td>
              <td data-label="Member">{t.user_name}</td>
              <td data-label="Type"><span className={`badge badge-${t.type}`}>{LABELS[t.type]}</span></td>
              <td data-label="Qty">{t.type === 'borrow' ? `−${t.quantity}` : `+${t.quantity}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
