import MealSlot from "./MealSlot";
import { MEAL_TYPES } from "../data/recipes";

const SHORT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEAL_LABELS = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" };
const todayStr = new Date().toISOString().split("T")[0];

export default function WeeklyPlanner({
  plan, recipes, weekStart, weekDates,
  onAssign, onClear, onClearWeek, onPrevWeek, onNextWeek,
  onAIPlan, aiPlanLoading, aiPlanError,
}) {
  const monthLabel = weekStart.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="planner-section">
      <div className="section-header">
        <h2>Weekly Meal Plan</h2>
        <div className="section-header-actions">
          <button className="btn-ai" onClick={onAIPlan} disabled={aiPlanLoading}>
            {aiPlanLoading ? "Planning…" : "✨ AI Plan My Week"}
          </button>
          <button className="btn-secondary" onClick={onClearWeek}>
            Clear Week
          </button>
        </div>
      </div>

      <div className="planner-week-nav">
        <button className="planner-nav-btn" onClick={onPrevWeek} title="Previous week">‹</button>
        <span className="planner-week-label">{monthLabel}</span>
        <button className="planner-nav-btn" onClick={onNextWeek} title="Next week">›</button>
      </div>

      {aiPlanError && <p className="form-error" style={{ marginBottom: 12 }}>{aiPlanError}</p>}

      <div className="planner-cards">
        {weekDates.map((dateStr, i) => {
          const isToday = dateStr === todayStr;
          return (
            <div key={dateStr} className={`day-card ${isToday ? "day-card-today" : ""}`}>
              <div className="day-card-header">
                <span className="day-short">{SHORT_DAYS[i]}</span>
                <span className="day-date-num">{parseInt(dateStr.split("-")[2])}</span>
                {isToday && <span className="day-today-badge">Today</span>}
              </div>
              <div className="day-card-meals">
                {MEAL_TYPES.map((type) => (
                  <div key={type} className="day-meal-col">
                    <span className="day-meal-label">{MEAL_LABELS[type]}</span>
                    <MealSlot
                      dateStr={dateStr}
                      mealType={type}
                      meal={plan[dateStr]?.[type] ?? null}
                      recipes={recipes}
                      plan={plan}
                      onAssign={onAssign}
                      onClear={onClear}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
