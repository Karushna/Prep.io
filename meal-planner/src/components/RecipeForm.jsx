import { useState } from "react";
import { MEAL_TYPES, DIETARY_TAGS } from "../data/recipes";

const blank = { name: "", category: "dinner", tags: [], ingredientsText: "", stepsText: "", cookTime: "", servings: "" };

function toInitial(recipe) {
  if (!recipe) return blank;
  return {
    name: recipe.name,
    category: recipe.category,
    tags: recipe.tags ?? [],
    ingredientsText: recipe.ingredients.map((i) => `${i.name}: ${i.amount}`).join("\n"),
    stepsText: recipe.steps?.join("\n") ?? "",
    cookTime: recipe.cookTime ?? "",
    servings: recipe.servings ?? "",
  };
}

function parseIngredients(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const colon = line.indexOf(":");
      if (colon === -1) return { name: line, amount: "" };
      return { name: line.slice(0, colon).trim(), amount: line.slice(colon + 1).trim() };
    });
}

export default function RecipeForm({ initialRecipe, onSave, onCancel }) {
  const [form, setForm] = useState(() => toInitial(initialRecipe));
  const [error, setError] = useState("");

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleTag(tag) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  }

  function handleSave() {
    if (!form.name.trim()) { setError("Recipe name is required."); return; }
    const ingredients = parseIngredients(form.ingredientsText);
    if (ingredients.length === 0) { setError("Add at least one ingredient."); return; }
    onSave({
      name: form.name.trim(),
      category: form.category,
      tags: form.tags,
      ingredients,
      steps: form.stepsText.split("\n").map((s) => s.trim()).filter(Boolean),
      cookTime: form.cookTime ? parseInt(form.cookTime, 10) : undefined,
      servings: form.servings ? parseInt(form.servings, 10) : undefined,
    });
  }

  return (
    <div className="recipe-form">
      <h3>{initialRecipe ? "Edit Recipe" : "New Recipe"}</h3>

      <label className="form-label">
        Name
        <input
          className="form-input"
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Mushroom Risotto"
        />
      </label>

      <label className="form-label">
        Category
        <select className="form-input" value={form.category} onChange={(e) => set("category", e.target.value)}>
          {MEAL_TYPES.map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </label>

      <div className="form-label">
        Dietary tags
        <div className="tag-filter form-tags">
          {DIETARY_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`tag-btn ${form.tags.includes(tag) ? "active" : ""}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="form-row">
        <label className="form-label">
          Cook time <span className="form-hint">minutes</span>
          <input
            className="form-input"
            type="number"
            min="1"
            max="480"
            value={form.cookTime}
            onChange={(e) => set("cookTime", e.target.value)}
            placeholder="e.g. 30"
          />
        </label>
        <label className="form-label">
          Serves
          <input
            className="form-input"
            type="number"
            min="1"
            max="20"
            value={form.servings}
            onChange={(e) => set("servings", e.target.value)}
            placeholder="e.g. 4"
          />
        </label>
      </div>

      <label className="form-label">
        Ingredients <span className="form-hint">one per line — "Name: amount"</span>
        <textarea
          className="form-input form-textarea"
          value={form.ingredientsText}
          onChange={(e) => set("ingredientsText", e.target.value)}
          placeholder={"Rolled oats: 1 cup\nMilk: 250ml\nHoney: 1 tbsp"}
          rows={6}
        />
      </label>

      <label className="form-label">
        Steps <span className="form-hint">one step per line</span>
        <textarea
          className="form-input form-textarea"
          value={form.stepsText}
          onChange={(e) => set("stepsText", e.target.value)}
          placeholder={"Boil water and cook oats for 5 minutes\nSlice banana and place on top\nDrizzle with honey"}
          rows={5}
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button className="btn-primary" onClick={handleSave}>Save</button>
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
