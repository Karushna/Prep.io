export default function ShoppingList({ items, checked, onToggle }) {
  if (items.length === 0) {
    return (
      <div className="shopping-section">
        <h2>Shopping List</h2>
        <p className="empty-msg">Plan some meals to generate your shopping list.</p>
      </div>
    );
  }

  return (
    <div className="shopping-section">
      <div className="section-header">
        <h2>Shopping List</h2>
        <div className="section-header-actions">
          <span className="item-count">{items.length} items</span>
          <button className="btn-print" onClick={() => window.print()}>
            Print
          </button>
        </div>
      </div>
      <ul className="shopping-list">
        {items.map((item) => (
          <li
            key={item.name}
            className={`shopping-item ${checked[item.name] ? "checked" : ""}`}
            onClick={() => onToggle(item.name)}
          >
            <input
              type="checkbox"
              checked={!!checked[item.name]}
              onChange={() => onToggle(item.name)}
            />
            <div className="item-details">
              <span className="item-name">{item.name}</span>
              <span className="item-amounts">
                {item.amounts.map((a, i) => (
                  <span key={i} className="amount-tag">
                    {a.amount} <em>({a.recipe})</em>
                  </span>
                ))}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
