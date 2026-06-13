import { useState } from "react";
import { organizeShoppingList } from "../services/openai";

export default function ShoppingList({ items, checked, onToggle }) {
  const [organized, setOrganized] = useState(null); // null | { [section]: items[] }
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgError, setOrgError] = useState("");

  async function handleOrganize() {
    setOrgLoading(true);
    setOrgError("");
    try {
      const result = await organizeShoppingList(items);
      // Build a map from item name (lowercase) → section
      const nameToSection = {};
      result.categories.forEach((cat) => {
        cat.items.forEach((name) => {
          nameToSection[name.toLowerCase()] = cat.section;
        });
      });
      // Group shopping items by section
      const groups = {};
      items.forEach((item) => {
        const section = nameToSection[item.name.toLowerCase()] ?? "Other";
        if (!groups[section]) groups[section] = [];
        groups[section].push(item);
      });
      setOrganized(groups);
    } catch (e) {
      setOrgError(e.message);
    } finally {
      setOrgLoading(false);
    }
  }

  function renderItem(item) {
    return (
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
        <a
          href={`https://www.walmart.com/search?q=${encodeURIComponent(item.name)}`}
          target="_blank"
          rel="noreferrer"
          className="btn-walmart"
          onClick={(e) => e.stopPropagation()}
          title={`Buy ${item.name} on Walmart`}
        >
          Buy
        </a>
      </li>
    );
  }

  if (items.length === 0) {
    return (
      <div className="shopping-section">
        <h2>Shopping List</h2>
        <p className="empty-msg">Plan some meals to generate your shopping list.</p>
      </div>
    );
  }

  if (organized) {
    const sections = Object.keys(organized);
    return (
      <div className="shopping-section">
        <div className="section-header">
          <h2>Shopping List</h2>
          <div className="section-header-actions">
            <span className="item-count">{items.length} items</span>
            <button className="btn-secondary" onClick={() => setOrganized(null)}>Flat view</button>
            <button className="btn-print" onClick={() => window.print()}>Print</button>
          </div>
        </div>
        {sections.map((section) => (
          <div key={section} className="shopping-aisle-group">
            <h3 className="shopping-aisle-label">{section}</h3>
            <ul className="shopping-list">
              {organized[section].map(renderItem)}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="shopping-section">
      <div className="section-header">
        <h2>Shopping List</h2>
        <div className="section-header-actions">
          <span className="item-count">{items.length} items</span>
          <button className="btn-ai" onClick={handleOrganize} disabled={orgLoading}>
            {orgLoading ? "Organizing…" : "✨ Organize by Aisle"}
          </button>
          <button className="btn-print" onClick={() => window.print()}>Print</button>
        </div>
      </div>
      {orgError && <p className="form-error" style={{ marginBottom: 12 }}>{orgError}</p>}
      <ul className="shopping-list">
        {items.map(renderItem)}
      </ul>
    </div>
  );
}
