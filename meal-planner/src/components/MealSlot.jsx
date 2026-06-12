import { useState } from "react";
import { DIETARY_TAGS } from "../data/recipes";

export default function MealSlot({ day, mealType, meal, recipes, onAssign, onClear }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState([]);

  function closeModal() {
    setOpen(false);
    setSearch("");
    setActiveTags([]);
  }

  function toggleTag(tag) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

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
        <button className="btn-add" onClick={() => setOpen(true)}>
          + Add
        </button>
      )}

      {open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {mealType.charAt(0).toUpperCase() + mealType.slice(1)} — {day}
            </h3>

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
                  <li
                    key={r.id}
                    onClick={() => {
                      onAssign(day, mealType, r);
                      closeModal();
                    }}
                  >
                    <span>{r.name}</span>
                    {r.tags?.length > 0 && (
                      <span className="recipe-tags">
                        {r.tags.map((t) => (
                          <span key={t} className="recipe-tag">{t}</span>
                        ))}
                      </span>
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
