import { useState, useEffect } from "react";
import WeeklyPlanner from "./components/WeeklyPlanner";
import ShoppingList from "./components/ShoppingList";
import RecipeManager from "./components/RecipeManager";
import { useMealPlan } from "./hooks/useMealPlan";
import { useRecipes } from "./hooks/useRecipes";
import "./App.css";

export default function App() {
  const { plan, assignMeal, clearMeal, clearAll, getShoppingList } = useMealPlan();
  const { allRecipes, customRecipes, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const [tab, setTab] = useState("planner");

  const [checked, setChecked] = useState(() => {
    try {
      const saved = localStorage.getItem("shoppingChecked");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const shoppingList = getShoppingList();

  // Prune stale checked keys when plan changes
  useEffect(() => {
    const validNames = new Set(shoppingList.map((i) => i.name));
    setChecked((prev) => {
      const pruned = Object.fromEntries(
        Object.entries(prev).filter(([k]) => validNames.has(k))
      );
      localStorage.setItem("shoppingChecked", JSON.stringify(pruned));
      return pruned;
    });
  }, [plan]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleChecked(name) {
    setChecked((prev) => {
      const next = { ...prev, [name]: !prev[name] };
      localStorage.setItem("shoppingChecked", JSON.stringify(next));
      return next;
    });
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Meal Planner</h1>
        <nav className="tabs">
          <button
            className={`tab ${tab === "planner" ? "active" : ""}`}
            onClick={() => setTab("planner")}
          >
            Weekly Plan
          </button>
          <button
            className={`tab ${tab === "shopping" ? "active" : ""}`}
            onClick={() => setTab("shopping")}
          >
            Shopping List
            {shoppingList.length > 0 && (
              <span className="badge">{shoppingList.length}</span>
            )}
          </button>
          <button
            className={`tab ${tab === "recipes" ? "active" : ""}`}
            onClick={() => setTab("recipes")}
          >
            My Recipes
            {customRecipes.length > 0 && (
              <span className="badge">{customRecipes.length}</span>
            )}
          </button>
        </nav>
      </header>

      <main className="app-main">
        {tab === "planner" && (
          <WeeklyPlanner
            plan={plan}
            recipes={allRecipes}
            onAssign={assignMeal}
            onClear={clearMeal}
            onClearAll={clearAll}
          />
        )}
        {tab === "shopping" && (
          <ShoppingList items={shoppingList} checked={checked} onToggle={toggleChecked} />
        )}
        {tab === "recipes" && (
          <RecipeManager
            customRecipes={customRecipes}
            onAdd={addRecipe}
            onUpdate={updateRecipe}
            onDelete={deleteRecipe}
          />
        )}
      </main>
    </div>
  );
}
