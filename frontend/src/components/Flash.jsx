export default function Flash({ flash }) {
  if (!flash) return null;
  return <div className={`flash flash-${flash.type}`} role="status">{flash.text}</div>;
}
