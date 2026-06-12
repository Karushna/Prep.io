import { useState } from "react";
import RecipeForm from "./RecipeForm";
import { recipes as builtInRecipes } from "../data/recipes";

export default function RecipeManager({ customRecipes, onAdd, onUpdate, onDelete }) {
  const [formState, setFormState] = useState(null); // null | "new" | { recipe }

  function handleSave(recipeData) {
    if (formState === "new") {
      onAdd(recipeData);
    } else {
      onUpdate(formState.recipe.id, recipeData);
    }
    setFormState(null);
  }

  if (formState) {
    return (
      <RecipeForm
        initialRecipe={formState === "new" ? null : formState.recipe}
        onSave={handleSave}
        onCancel={() => setFormState(null)}
      />
    );
  }

  return (
    <div className="recipe-manager">
      <div className="section-header">
        <h2>My Recipes</h2>
        <button className="btn-primary" onClick={() => setFormState("new")}>
          + New Recipe
        </button>
      </div>

      {customRecipes.length > 0 && (
        <section className="recipe-section">
          <h3 className="recipe-section-title">Custom ({customRecipes.length})</h3>
          <ul className="manager-list">
            {customRecipes.map((r) => (
              <li key={r.id} className="manager-item">
                <div className="manager-item-info">
                  <span className="manager-item-name">{r.name}</span>
                  <span className="manager-item-meta">
                    {r.category}
                    {r.cookTime && <> · 🕐 {r.cookTime} min</>}
                    {r.servings && <> · Serves {r.servings}</>}
                    {r.tags?.length > 0 && (
                      <> · {r.tags.map((t) => <span key={t} className="recipe-tag">{t}</span>)}</>
                    )}
                  </span>
                </div>
                <div className="manager-item-actions">
                  <button className="btn-icon" onClick={() => setFormState({ recipe: r })} title="Edit">✏️</button>
                  <button
                    className="btn-icon btn-icon-danger"
                    onClick={() => { if (window.confirm(`Delete "${r.name}"?`)) onDelete(r.id); }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="recipe-section">
        <h3 className="recipe-section-title">Built-in ({builtInRecipes.length})</h3>
        <ul className="manager-list">
          {builtInRecipes.map((r) => (
            <li key={r.id} className="manager-item manager-item-readonly">
              <div className="manager-item-info">
                <span className="manager-item-name">{r.name}</span>
                <span className="manager-item-meta">
                  {r.category}
                  {r.tags?.length > 0 && (
                    <> · {r.tags.map((t) => <span key={t} className="recipe-tag">{t}</span>)}</>
                  )}
                </span>
              </div>
              <span className="readonly-badge">built-in</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
