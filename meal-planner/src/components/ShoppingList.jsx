import { useState } from "react";
import { organizeShoppingList } from "../services/openai";

export default function ShoppingList({ items, checked, onToggle }) {
  const [view, setView] = useState("flat");
  const [aisleGroups, setAisleGroups] = useState(null);
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgError, setOrgError] = useState("");

  const checkedCount = items.filter((i) => checked[i.name]).length;
  const progressPct = items.length > 0 ? (checkedCount / items.length) * 100 : 0;

  async function handleOrganize() {
    setOrgLoading(true);
    setOrgError("");
    try {
      const result = await organizeShoppingList(items);
      const nameToSection = {};
      result.categories.forEach((cat) => {
        cat.items.forEach((name) => {
          nameToSection[name.toLowerCase()] = cat.section;
        });
      });
      const groups = {};
      items.forEach((item) => {
        const section = nameToSection[item.name.toLowerCase()] ?? "Other";
        if (!groups[section]) groups[section] = [];
        groups[section].push(item);
      });
      setAisleGroups(groups);
      setView("aisle");
    } catch (e) {
      setOrgError(e.message);
    } finally {
      setOrgLoading(false);
    }
  }

  function renderStats() {
    const mealsCount = new Set(
      items.flatMap((item) => item.amounts.filter((a) => a.dateStr).map((a) => `${a.dateStr}-${a.mealType}`))
    ).size;
    const itemsLeft = items.length - checkedCount;
    return (
      <div className="shopping-stats">
        <span className="shopping-stat">{mealsCount} meal{mealsCount !== 1 ? "s" : ""} planned</span>
        <span className="shopping-stat-sep">·</span>
        <span className="shopping-stat">{items.length} ingredient{items.length !== 1 ? "s" : ""}</span>
        <span className="shopping-stat-sep">·</span>
        <span className="shopping-stat shopping-stat-left">
          {itemsLeft === 0 ? "All done!" : `${itemsLeft} left to buy`}
        </span>
        <div className="shopping-progress-bar">
          <div className="shopping-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>
    );
  }

  function renderDayView() {
    const dayMap = {};
    items.forEach((item) => {
      item.amounts.forEach((a) => {
        if (!a.dateStr) return;
        if (!dayMap[a.dateStr]) {
          dayMap[a.dateStr] = { label: a.day, dateStr: a.dateStr };
        }
      });
    });
    const days = Object.values(dayMap).sort((a, b) => a.dateStr.localeCompare(b.dateStr));
    return days.map(({ label, dateStr }) => {
      const dayItems = items.filter((item) =>
        item.amounts.some((a) => a.dateStr === dateStr)
      );
      return (
        <div key={dateStr} className="shopping-day-group">
          <h3 className="shopping-day-label">{label}</h3>
          <ul className="shopping-list">{dayItems.map(renderItem)}</ul>
        </div>
      );
    });
  }

  function renderItem(item) {
    const isDone = !!checked[item.name];
    return (
      <li
        key={item.name}
        className={`shopping-item ${isDone ? "checked" : ""}`}
        onClick={() => onToggle(item.name)}
      >
        <input
          type="checkbox"
          checked={isDone}
          onChange={() => onToggle(item.name)}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="item-details">
          <span className="item-name">{item.name}</span>
          <span className="item-amounts">
            {item.amounts.map((a, i) => (
              <span key={i} className="amount-tag">
                {i > 0 && <span className="amount-sep"> · </span>}
                {a.day && (
                  <span className="amount-day-ctx">
                    {a.day.slice(0, 3)} · {a.mealType.charAt(0).toUpperCase() + a.mealType.slice(1)} ·{" "}
                  </span>
                )}
                {a.amount && <>{a.amount} </>}
                <em>{a.recipe}</em>
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

  return (
    <div className="shopping-section">
      <div className="section-header">
        <h2>Shopping List</h2>
        <div className="section-header-actions">
          {view !== "flat" && (
            <button className="btn-secondary" onClick={() => setView("flat")}>Flat</button>
          )}
          {view !== "day" && (
            <button className="btn-secondary" onClick={() => setView("day")}>By Day</button>
          )}
          <button className="btn-ai" onClick={handleOrganize} disabled={orgLoading}>
            {orgLoading ? "Organizing…" : "✨ By Aisle"}
          </button>
          <button className="btn-print" onClick={() => window.print()}>Print</button>
        </div>
      </div>
      {orgError && <p className="form-error" style={{ marginBottom: 12 }}>{orgError}</p>}
      {renderStats()}
      {view === "flat" && (
        <ul className="shopping-list">{items.map(renderItem)}</ul>
      )}
      {view === "day" && renderDayView()}
      {view === "aisle" && aisleGroups && Object.keys(aisleGroups).map((section) => (
        <div key={section} className="shopping-aisle-group">
          <h3 className="shopping-aisle-label">{section}</h3>
          <ul className="shopping-list">{aisleGroups[section].map(renderItem)}</ul>
        </div>
      ))}
    </div>
  );
}
