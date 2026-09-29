export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="banner error" role="alert">
      <span>{message}</span>
      {onRetry && <button className="btn small" onClick={onRetry}>Tentar novamente</button>}
    </div>
  );
}

export function Empty({ children }) {
  return <div className="empty">{children}</div>;
}
