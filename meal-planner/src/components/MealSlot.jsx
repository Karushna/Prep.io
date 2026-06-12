import { useState } from "react";
import { DIETARY_TAGS, DAYS, MEAL_TYPES } from "../data/recipes";

export default function MealSlot({ day, mealType, meal, recipes, plan, onAssign, onClear }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const [manualName, setManualName] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  function closeModal() {
    setOpen(false);
    setSearch("");
    setActiveTags([]);
    setManualName("");
    setExpandedId(null);
  }

  function addManualMeal() {
    const trimmed = manualName.trim();
    if (!trimmed) return;
    onAssign(day, mealType, { id: `manual-${Date.now()}`, name: trimmed, ingredients: [], tags: [], category: mealType });
    closeModal();
  }

  function surpriseMe() {
    const pool = recipes.filter((r) => r.category === mealType);
    if (pool.length === 0) return;
    onAssign(day, mealType, pool[Math.floor(Math.random() * pool.length)]);
  }

  function toggleTag(tag) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function toggleExpand(e, id) {
    e.stopPropagation();
    setExpandedId((prev) => (prev === id ? null : id));
  }

  const usedIds = new Set(
    DAYS.flatMap((d) => MEAL_TYPES.map((t) => plan?.[d]?.[t]?.id)).filter(Boolean)
  );

  const filtered = recipes
    .filter((r) => r.category === mealType)
    .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    .filter((r) => activeTags.length === 0 || activeTags.every((tag) => r.tags?.includes(tag)));

  return (
    <div className="meal-slot">
      {meal ? (
        <div className="meal-card">
          <span className="meal-name">{meal.name}</span>
          <button className="btn-clear" onClick={() => onClear(day, mealType)} title="Remove">
            ×
          </button>
        </div>
      ) : (
        <div className="slot-empty-actions">
          <button className="btn-add" onClick={() => setOpen(true)}>
            + Add
          </button>
          <button className="btn-surprise" onClick={surpriseMe} title="Surprise me — pick a random meal">
            🎲
          </button>
        </div>
      )}

      {open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {mealType.charAt(0).toUpperCase() + mealType.slice(1)} — {day}
            </h3>

            <div className="manual-entry">
              <input
                className="manual-input"
                type="text"
                placeholder="Type a meal name…"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addManualMeal()}
              />
              <button className="btn-primary" onClick={addManualMeal} disabled={!manualName.trim()}>
                Add
              </button>
            </div>

            <div className="manual-divider">or choose from recipes</div>

            <input
              className="recipe-search"
              type="text"
              placeholder="Search recipes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />

            <div className="tag-filter">
              {DIETARY_TAGS.map((tag) => (
                <button
                  key={tag}
                  className={`tag-btn ${activeTags.includes(tag) ? "active" : ""}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="no-results">No recipes match your filters.</p>
            ) : (
              <ul className="recipe-list">
                {filtered.map((r) => (
                  <li key={r.id}>
                    <div
                      className="recipe-row"
                      onClick={() => {
                        onAssign(day, mealType, r);
                        closeModal();
                      }}
                    >
                      <div className="recipe-row-left">
                        <span>{r.name}</span>
                        {usedIds.has(r.id) && (
                          <span className="badge-in-plan">In plan</span>
                        )}
                      </div>
                      <div className="recipe-row-right">
                        {r.tags?.length > 0 && (
                          <span className="recipe-tags">
                            {r.tags.map((t) => (
                              <span key={t} className="recipe-tag">{t}</span>
                            ))}
                          </span>
                        )}
                        {r.ingredients?.length > 0 && (
                          <button
                            className="btn-expand"
                            onClick={(e) => toggleExpand(e, r.id)}
                            title="Preview ingredients"
                          >
                            {expandedId === r.id ? "▲" : "▼"}
                          </button>
                        )}
                      </div>
                    </div>
                    {expandedId === r.id && (
                      <ul className="preview-ingredients">
                        {r.ingredients.map((ing, i) => (
                          <li key={i}>{ing.amount ? `${ing.name} — ${ing.amount}` : ing.name}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <button className="btn-secondary" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
