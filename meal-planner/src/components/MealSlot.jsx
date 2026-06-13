import { useState } from "react";
import { DIETARY_TAGS, MEAL_TYPES } from "../data/recipes";

export default function MealSlot({ dateStr, mealType, meal, recipes, plan, onAssign, onClear }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const [manualName, setManualName] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [timeFilter, setTimeFilter] = useState("any");

  function closeModal() {
    setOpen(false);
    setSearch("");
    setActiveTags([]);
    setManualName("");
    setExpandedId(null);
    setTimeFilter("any");
  }

  function addManualMeal() {
    const trimmed = manualName.trim();
    if (!trimmed) return;
    onAssign(dateStr, mealType, { id: `manual-${Date.now()}`, name: trimmed, ingredients: [], tags: [], category: mealType });
    closeModal();
  }

  function surpriseMe() {
    const pool = recipes.filter((r) => r.category === mealType);
    if (pool.length === 0) return;
    onAssign(dateStr, mealType, pool[Math.floor(Math.random() * pool.length)]);
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
    Object.values(plan ?? {}).flatMap((dayPlan) =>
      MEAL_TYPES.map((t) => dayPlan?.[t]?.id)
    ).filter(Boolean)
  );

  const filtered = recipes
    .filter((r) => r.category === mealType)
    .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    .filter((r) => activeTags.length === 0 || activeTags.every((tag) => r.tags?.includes(tag)))
    .filter((r) => {
      if (timeFilter === "quick") return r.cookTime && r.cookTime <= 20;
      if (timeFilter === "medium") return r.cookTime && r.cookTime <= 45;
      return true;
    });

  return (
    <div className="meal-slot">
      {meal ? (
        <div className="meal-card">
          <div className="meal-info">
            <span className="meal-name">{meal.name}</span>
            {meal.cookTime && (
              <span className="meal-meta">
                🕐 {meal.cookTime} min{meal.servings ? ` · serves ${meal.servings}` : ""}
              </span>
            )}
          </div>
          <button className="btn-clear" onClick={() => onClear(dateStr, mealType)} title="Remove">
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
              {mealType.charAt(0).toUpperCase() + mealType.slice(1)} — {dateStr}
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

            <div className="time-filter">
              {[
                { id: "any", label: "Any time" },
                { id: "quick", label: "Quick · ≤ 20 min" },
                { id: "medium", label: "Under 45 min" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  className={`tag-btn ${timeFilter === opt.id ? "active" : ""}`}
                  onClick={() => setTimeFilter(opt.id)}
                >
                  {opt.label}
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
                        onAssign(dateStr, mealType, r);
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
                        {r.cookTime && (
                          <span className="cook-time-badge">🕐 {r.cookTime} min</span>
                        )}
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
                      <div className="preview-expanded">
                        <ul className="preview-ingredients">
                          {r.ingredients.map((ing, i) => (
                            <li key={i}>{ing.amount ? `${ing.name} — ${ing.amount}` : ing.name}</li>
                          ))}
                        </ul>
                        {r.steps?.length > 0 && (
                          <>
                            <p className="preview-steps-label">Steps</p>
                            <ol className="preview-steps">
                              {r.steps.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                          </>
                        )}
                      </div>
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
