import { useState, useEffect } from "react";
import WeeklyPlanner from "./components/WeeklyPlanner";
import ShoppingList from "./components/ShoppingList";
import RecipeManager from "./components/RecipeManager";
import { useMealPlan } from "./hooks/useMealPlan";
import { useRecipes } from "./hooks/useRecipes";
import { DAYS, MEAL_TYPES } from "./data/recipes";
import "./App.css";

export default function App() {
  const { plan, assignMeal, clearMeal, clearAll, getShoppingList } = useMealPlan();
  const { allRecipes, customRecipes, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const [tab, setTab] = useState("home");

  const [checked, setChecked] = useState(() => {
    try {
      const saved = localStorage.getItem("shoppingChecked");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const shoppingList = getShoppingList();

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

  const mealsPlanned = DAYS.reduce(
    (sum, day) => sum + MEAL_TYPES.filter((t) => plan[day][t] !== null).length,
    0
  );

  const navItems = [
    { id: "home", label: "Home", icon: "⌂" },
    { id: "planner", label: "Weekly Plan", icon: "📅", badge: mealsPlanned > 0 ? `${mealsPlanned}/21` : null },
    { id: "shopping", label: "Shopping List", icon: "🛒", badge: shoppingList.length > 0 ? shoppingList.length : null },
    { id: "recipes", label: "My Recipes", icon: "🍴", badge: customRecipes.length > 0 ? customRecipes.length : null },
  ];

  return (
    <div className="app">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">🥗</span>
          <span className="sidebar-title">Meal Planner</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${tab === item.id ? "active" : ""}`}
              onClick={() => setTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <main className="app-content">
        {tab === "home" && (
          <div className="home-page">
            <div className="home-hero">
              <h1>Plan your week,<br />simplify your shopping.</h1>
              <p>Organise meals for every day, build your recipe library, and get a ready-to-go shopping list — all in one place.</p>
            </div>

            <div className="home-cards">
              <button className="home-card" onClick={() => setTab("planner")}>
                <span className="home-card-icon">📅</span>
                <div className="home-card-body">
                  <h3>Weekly Plan</h3>
                  <p>{mealsPlanned > 0 ? `${mealsPlanned} of 21 meals planned this week` : "No meals planned yet — start adding"}</p>
                </div>
                <span className="home-card-arrow">→</span>
              </button>

              <button className="home-card" onClick={() => setTab("shopping")}>
                <span className="home-card-icon">🛒</span>
                <div className="home-card-body">
                  <h3>Shopping List</h3>
                  <p>{shoppingList.length > 0 ? `${shoppingList.length} ingredient${shoppingList.length !== 1 ? "s" : ""} to buy` : "Plan meals to generate your list"}</p>
                </div>
                <span className="home-card-arrow">→</span>
              </button>

              <button className="home-card" onClick={() => setTab("recipes")}>
                <span className="home-card-icon">🍴</span>
                <div className="home-card-body">
                  <h3>My Recipes</h3>
                  <p>{allRecipes.length} recipes available · {customRecipes.length} custom</p>
                </div>
                <span className="home-card-arrow">→</span>
              </button>
            </div>
          </div>
        )}

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
