import { useState } from "react";
import RecipeForm from "./RecipeForm";
import { recipes as builtInRecipes } from "../data/recipes";
import { generateRecipe, estimateNutrition } from "../services/openai";

export default function RecipeManager({ customRecipes, onAdd, onUpdate, onDelete }) {
  const [formState, setFormState] = useState(null); // null | "new" | { recipe } | { recipe, isAI: true }
  const [aiPanel, setAiPanel] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [nutrition, setNutrition] = useState({}); // { [id]: data | "loading" | { error } }

  async function handleGenerate() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError("");
    try {
      const recipe = await generateRecipe(aiPrompt);
      setAiPanel(false);
      setAiPrompt("");
      setFormState({ recipe, isAI: true });
    } catch (e) {
      setAiError(e.message);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleNutrition(recipe) {
    setNutrition((prev) => ({ ...prev, [recipe.id]: "loading" }));
    try {
      const data = await estimateNutrition(recipe);
      setNutrition((prev) => ({ ...prev, [recipe.id]: data }));
    } catch (e) {
      setNutrition((prev) => ({ ...prev, [recipe.id]: { error: e.message } }));
    }
  }

  function handleSave(recipeData) {
    if (formState === "new" || formState?.isAI) {
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
      {aiPanel ? (
        <div className="ai-panel">
          <h3>✨ Generate Recipe with AI</h3>
          <p className="ai-panel-hint">
            Describe what you want — e.g. "quick vegan dinner with chickpeas" or "high-protein breakfast under 15 minutes"
          </p>
          <textarea
            className="form-input form-textarea"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Describe your ideal recipe..."
            rows={3}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
          />
          {aiError && <p className="form-error">{aiError}</p>}
          <div className="form-actions">
            <button className="btn-primary" onClick={handleGenerate} disabled={aiLoading || !aiPrompt.trim()}>
              {aiLoading ? "Generating..." : "Generate"}
            </button>
            <button className="btn-secondary" onClick={() => { setAiPanel(false); setAiError(""); }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="section-header">
            <h2>My Recipes</h2>
            <div className="section-header-actions">
              <button className="btn-ai" onClick={() => setAiPanel(true)}>✨ Generate with AI</button>
              <button className="btn-primary" onClick={() => setFormState("new")}>+ New Recipe</button>
            </div>
          </div>

          {customRecipes.length > 0 && (
            <section className="recipe-section">
              <h3 className="recipe-section-title">Custom ({customRecipes.length})</h3>
              <ul className="manager-list">
                {customRecipes.map((r) => (
                  <li key={r.id} className="manager-item manager-item-column">
                    <div className="manager-item-row">
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
                        <button
                          className="btn-icon"
                          onClick={() => handleNutrition(r)}
                          title="Estimate nutrition"
                          disabled={nutrition[r.id] === "loading"}
                        >
                          {nutrition[r.id] === "loading" ? "…" : "🥗"}
                        </button>
                        <button className="btn-icon" onClick={() => setFormState({ recipe: r })} title="Edit">✏️</button>
                        <button
                          className="btn-icon btn-icon-danger"
                          onClick={() => { if (window.confirm(`Delete "${r.name}"?`)) onDelete(r.id); }}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    {nutrition[r.id] && nutrition[r.id] !== "loading" && (
                      <div className="nutrition-row">
                        {nutrition[r.id].error ? (
                          <span className="nutrition-error">{nutrition[r.id].error}</span>
                        ) : (
                          <>
                            <span className="nutrition-badge">{nutrition[r.id].calories} kcal</span>
                            <span className="nutrition-badge">Protein: {nutrition[r.id].protein}</span>
                            <span className="nutrition-badge">Carbs: {nutrition[r.id].carbs}</span>
                            <span className="nutrition-badge">Fat: {nutrition[r.id].fat}</span>
                          </>
                        )}
                      </div>
                    )}
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
        </>
      )}
    </div>
  );
}
