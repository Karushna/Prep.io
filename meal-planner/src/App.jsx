import { useState, useEffect } from "react";
import WeeklyPlanner from "./components/WeeklyPlanner";
import ShoppingList from "./components/ShoppingList";
import RecipeManager from "./components/RecipeManager";
import ChatBot from "./components/ChatBot";
import { useMealPlan, getMonday, getWeekDates } from "./hooks/useMealPlan";
import { useRecipes } from "./hooks/useRecipes";
import { DAYS, MEAL_TYPES } from "./data/recipes";
import { planWeek, suggestFromIngredients, estimateNutrition } from "./services/openai";
import "./App.css";

export default function App() {
  const { plan, assignMeal, clearMeal, clearWeek, getShoppingList } = useMealPlan();
  const { allRecipes, customRecipes, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const [tab, setTab] = useState("home");
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const weekDates = getWeekDates(weekStart);

  function prevWeek() {
    setWeekStart((d) => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; });
  }
  function nextWeek() {
    setWeekStart((d) => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; });
  }

  const [checked, setChecked] = useState(() => {
    try {
      const saved = localStorage.getItem("shoppingChecked");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // AI plan state
  const [aiPlanLoading, setAiPlanLoading] = useState(false);
  const [aiPlanError, setAiPlanError] = useState("");

  // Fridge scan state
  const [fridgeInput, setFridgeInput] = useState("");
  const [fridgeResult, setFridgeResult] = useState(null);
  const [fridgeLoading, setFridgeLoading] = useState(false);
  const [fridgeError, setFridgeError] = useState("");

  // Nutrition dashboard state
  const [nutritionCache, setNutritionCache] = useState({});
  const [weekNutrition, setWeekNutrition] = useState(null);
  const [nutritionLoading, setNutritionLoading] = useState(false);

  const shoppingList = getShoppingList(weekDates);

  useEffect(() => {
    const validNames = new Set(shoppingList.map((i) => i.name));
    setChecked((prev) => {
      const pruned = Object.fromEntries(
        Object.entries(prev).filter(([k]) => validNames.has(k))
      );
      localStorage.setItem("shoppingChecked", JSON.stringify(pruned));
      return pruned;
    });
  }, [plan, weekDates.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleChecked(name) {
    setChecked((prev) => {
      const next = { ...prev, [name]: !prev[name] };
      localStorage.setItem("shoppingChecked", JSON.stringify(next));
      return next;
    });
  }

  async function handleAIPlan() {
    setAiPlanLoading(true);
    setAiPlanError("");
    try {
      const result = await planWeek(allRecipes, plan, DAYS, MEAL_TYPES);
      const recipeMap = Object.fromEntries(allRecipes.map((r) => [String(r.id), r]));
      result.assignments.forEach(({ day, type, recipeId }) => {
        const dateStr = weekDates[DAYS.indexOf(day)];
        if (!dateStr) return;
        const recipe = recipeMap[String(recipeId)];
        if (recipe && !plan[dateStr]?.[type]) {
          assignMeal(dateStr, type, recipe);
        }
      });
    } catch (e) {
      setAiPlanError(e.message);
    } finally {
      setAiPlanLoading(false);
    }
  }

  async function handleFridgeScan() {
    if (!fridgeInput.trim()) return;
    setFridgeLoading(true);
    setFridgeError("");
    setFridgeResult(null);
    try {
      const result = await suggestFromIngredients(fridgeInput, allRecipes);
      setFridgeResult(result);
    } catch (e) {
      setFridgeError(e.message);
    } finally {
      setFridgeLoading(false);
    }
  }

  async function handleWeekNutrition() {
    setNutritionLoading(true);
    const seen = new Set();
    const recipes = [];
    for (const dateStr of weekDates) {
      for (const type of MEAL_TYPES) {
        const r = plan[dateStr]?.[type];
        if (r && r.ingredients?.length > 0 && !seen.has(String(r.id))) {
          seen.add(String(r.id));
          recipes.push(r);
        }
      }
    }

    const totalMeals = weekDates.reduce(
      (sum, dateStr) => sum + MEAL_TYPES.filter((t) => plan[dateStr]?.[t] !== null).length,
      0
    );

    const results = await Promise.all(
      recipes.map(async (r) => {
        const key = String(r.id);
        if (nutritionCache[key] && nutritionCache[key] !== "loading" && !nutritionCache[key].error) {
          return nutritionCache[key];
        }
        try {
          const data = await estimateNutrition(r);
          setNutritionCache((prev) => ({ ...prev, [key]: data }));
          return data;
        } catch {
          return null;
        }
      })
    );

    const valid = results.filter(Boolean);
    const totalCal = valid.reduce((s, d) => s + (d.calories ?? 0), 0);
    const totalProtein = valid.reduce((s, d) => s + (parseInt(d.protein) || 0), 0);
    const totalCarbs = valid.reduce((s, d) => s + (parseInt(d.carbs) || 0), 0);
    const totalFat = valid.reduce((s, d) => s + (parseInt(d.fat) || 0), 0);

    setWeekNutrition({
      totalCal,
      avgCal: totalMeals > 0 ? Math.round(totalCal / 7) : 0,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      covered: totalMeals,
      total: 21,
    });
    setNutritionLoading(false);
  }

  function handleSaveFridgeSuggestion() {
    if (!fridgeResult?.suggestion) return;
    addRecipe(fridgeResult.suggestion);
    setFridgeResult(null);
    setFridgeInput("");
    setTab("recipes");
  }

  const mealsPlanned = weekDates.reduce(
    (sum, dateStr) => sum + MEAL_TYPES.filter((t) => plan[dateStr]?.[t] !== null).length,
    0
  );

  const todayDateStr = new Date().toISOString().split("T")[0];
  const todayDayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const navItems = [
    { id: "home", label: "Home", icon: "⌂" },
    { id: "chat", label: "AI Chat", icon: "💬" },
    { id: "planner", label: "Weekly Plan", icon: "📅", badge: mealsPlanned > 0 ? `${mealsPlanned}/21` : null },
    { id: "shopping", label: "Shopping List", icon: "🛒", badge: shoppingList.length > 0 ? shoppingList.length : null },
    { id: "recipes", label: "My Recipes", icon: "🍴", badge: customRecipes.length > 0 ? customRecipes.length : null },
  ];

  return (
    <div className="app">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">🥗</span>
          <span className="sidebar-title">Prep.io</span>
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
            <div className="home-main">
            <div className="home-hero">
              <h1>Plan your meals,<br />simplify your cooking!</h1>
              <p>Organise meals for every day, build your recipe library, and get a ready-to-go shopping list — all in one place.</p>
            </div>

            <div className="fridge-scan">
              <h3>✨ What can I make?</h3>
              <p>Tell me what ingredients you have and I'll find matching recipes from your library.</p>
              <div className="fridge-input-row">
                <input
                  className="form-input"
                  value={fridgeInput}
                  onChange={(e) => setFridgeInput(e.target.value)}
                  placeholder="chicken, garlic, lemon, pasta..."
                  onKeyDown={(e) => { if (e.key === "Enter") handleFridgeScan(); }}
                />
                <button
                  className="btn-ai"
                  onClick={handleFridgeScan}
                  disabled={fridgeLoading || !fridgeInput.trim()}
                >
                  {fridgeLoading ? "Searching…" : "Find Recipes"}
                </button>
              </div>
              {fridgeError && <p className="form-error">{fridgeError}</p>}
              {fridgeResult && (
                <div className="fridge-results">
                  {fridgeResult.matches?.length > 0 ? (
                    <>
                      <p className="fridge-results-label">Recipes you can make:</p>
                      <ul className="fridge-match-list">
                        {fridgeResult.matches.map((match) => {
                          const recipe = allRecipes.find((r) => String(r.id) === String(match.recipeId));
                          if (!recipe) return null;
                          return (
                            <li key={match.recipeId} className="fridge-match-item">
                              <span className="manager-item-name">{recipe.name}</span>
                              {match.missing?.length > 0 && (
                                <span className="fridge-missing">Missing: {match.missing.join(", ")}</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  ) : (
                    <p className="fridge-results-label">No close matches found in your library.</p>
                  )}
                  {fridgeResult.suggestion && (
                    <div className="fridge-suggestion">
                      <p className="fridge-results-label">AI recipe suggestion:</p>
                      <p><strong>{fridgeResult.suggestion.name}</strong> · {fridgeResult.suggestion.category} · {fridgeResult.suggestion.cookTime} min</p>
                      <button className="btn-primary" onClick={handleSaveFridgeSuggestion}>
                        Save to My Recipes
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="nutrition-dashboard">
              <div className="nutrition-dashboard-header">
                <h3>📊 Weekly Nutrition</h3>
                <button
                  className="btn-ai"
                  onClick={handleWeekNutrition}
                  disabled={nutritionLoading || mealsPlanned === 0}
                >
                  {nutritionLoading ? "Calculating…" : weekNutrition ? "Recalculate" : "Calculate"}
                </button>
              </div>
              {weekNutrition ? (
                <>
                  <div className="nutrition-stats">
                    <div className="nutrition-stat">
                      <span className="nutrition-stat-value">{weekNutrition.totalCal.toLocaleString()}</span>
                      <span className="nutrition-stat-label">kcal / week</span>
                    </div>
                    <div className="nutrition-stat">
                      <span className="nutrition-stat-value">{weekNutrition.avgCal.toLocaleString()}</span>
                      <span className="nutrition-stat-label">kcal / day</span>
                    </div>
                    <div className="nutrition-stat">
                      <span className="nutrition-stat-value">{weekNutrition.protein}g</span>
                      <span className="nutrition-stat-label">protein / week</span>
                    </div>
                    <div className="nutrition-stat">
                      <span className="nutrition-stat-value">{weekNutrition.carbs}g</span>
                      <span className="nutrition-stat-label">carbs / week</span>
                    </div>
                    <div className="nutrition-stat">
                      <span className="nutrition-stat-value">{weekNutrition.fat}g</span>
                      <span className="nutrition-stat-label">fat / week</span>
                    </div>
                  </div>
                  <p className="nutrition-note">
                    Based on {weekNutrition.covered} of {weekNutrition.total} meals planned — AI estimates only.
                  </p>
                </>
              ) : (
                <p className="nutrition-empty">
                  {mealsPlanned === 0
                    ? "Plan some meals first, then calculate your weekly nutrition."
                    : "Click Calculate to get an AI estimate of your weekly nutrition."}
                </p>
              )}
            </div>
            </div>

            <div className="home-side">
              <p className="home-side-label">Quick access</p>
              <div className="home-cards">
                <button className="home-card" onClick={() => setTab("planner")}>
                  <span className="home-card-icon">📅</span>
                  <div className="home-card-body">
                    <h3>Weekly Plan</h3>
                    <p>{mealsPlanned > 0 ? `${mealsPlanned} of 21 meals planned` : "No meals planned yet"}</p>
                  </div>
                  <span className="home-card-arrow">→</span>
                </button>

                <button className="home-card" onClick={() => setTab("shopping")}>
                  <span className="home-card-icon">🛒</span>
                  <div className="home-card-body">
                    <h3>Shopping List</h3>
                    <p>{shoppingList.length > 0 ? `${shoppingList.length} item${shoppingList.length !== 1 ? "s" : ""} to buy` : "Plan meals to generate"}</p>
                  </div>
                  <span className="home-card-arrow">→</span>
                </button>

                <button className="home-card" onClick={() => setTab("recipes")}>
                  <span className="home-card-icon">🍴</span>
                  <div className="home-card-body">
                    <h3>My Recipes</h3>
                    <p>{allRecipes.length} recipes · {customRecipes.length} custom</p>
                  </div>
                  <span className="home-card-arrow">→</span>
                </button>

                <button className="home-card" onClick={() => setTab("chat")}>
                  <span className="home-card-icon">💬</span>
                  <div className="home-card-body">
                    <h3>AI Chat</h3>
                    <p>Plan meals and get suggestions</p>
                  </div>
                  <span className="home-card-arrow">→</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "planner" && (
          <WeeklyPlanner
            plan={plan}
            recipes={allRecipes}
            weekStart={weekStart}
            weekDates={weekDates}
            onAssign={assignMeal}
            onClear={clearMeal}
            onClearWeek={() => clearWeek(weekDates)}
            onPrevWeek={prevWeek}
            onNextWeek={nextWeek}
            onAIPlan={handleAIPlan}
            aiPlanLoading={aiPlanLoading}
            aiPlanError={aiPlanError}
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
        {tab === "chat" && (
          <div className="chat-layout">
            <ChatBot
              plan={plan}
              allRecipes={allRecipes}
              shoppingList={shoppingList}
              weekDates={weekDates}
              onAssignMeal={assignMeal}
              onClearMeal={clearMeal}
              onClearWeek={clearWeek}
              onAddRecipe={addRecipe}
              onNavigate={setTab}
            />
            <div className="chat-today-panel">
              <div className="chat-today-header">
                <span className="chat-today-heading">Today</span>
                <span className="chat-today-day">{todayDayName}</span>
              </div>
              {MEAL_TYPES.map((type) => {
                const meal = plan[todayDateStr]?.[type];
                return (
                  <div key={type} className="chat-today-slot">
                    <span className="chat-today-type">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                    <span className={`chat-today-meal ${meal ? "" : "chat-today-empty"}`}>
                      {meal ? meal.name : "Not planned"}
                    </span>
                  </div>
                );
              })}
              <button className="btn-secondary chat-today-action" onClick={() => setTab("planner")}>
                Go to Planner →
              </button>
              <p className="chat-today-note">{mealsPlanned} of 21 meals planned this week</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
