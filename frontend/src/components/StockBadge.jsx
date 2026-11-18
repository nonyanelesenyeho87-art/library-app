export const LOW_STOCK_LIMIT = 2; // "low" = fewer than 2 copies

export default function StockBadge({ quantity }) {
  if (quantity === 0) return <span className="badge badge-out">Out of stock</span>;
  if (quantity < LOW_STOCK_LIMIT) return <span className="badge badge-low">Low stock</span>;
  return <span className="badge badge-ok">In stock</span>;
}
