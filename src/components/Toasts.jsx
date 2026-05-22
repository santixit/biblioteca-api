function Toasts({ items }) {
  return (
    <div className="toasts" aria-live="polite">
      {items.map((toast) => (
        <div className={`toast toast-${toast.type}`} key={toast.id}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export default Toasts;
