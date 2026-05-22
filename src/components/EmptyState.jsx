function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="state-box">
      {Icon && <Icon className="state-icon" size={30} />}
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export default EmptyState;
