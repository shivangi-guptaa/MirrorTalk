function Card({ title, subtitle, children }) {
  return (
    <div className="card">
      {title && <h2>{title}</h2>}
      {subtitle && <p className="muted">{subtitle}</p>}
      {children}
    </div>
  );
}

export default Card;
