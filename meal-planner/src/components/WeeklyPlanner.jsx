import MealSlot from "./MealSlot";
import { DAYS, MEAL_TYPES } from "../data/recipes";

export default function WeeklyPlanner({ plan, recipes, onAssign, onClear, onClearAll, onAIPlan, aiPlanLoading, aiPlanError }) {
  return (
    <div className="planner-section">
      <div className="section-header">
        <h2>Weekly Meal Plan</h2>
        <div className="section-header-actions">
          <button className="btn-ai" onClick={onAIPlan} disabled={aiPlanLoading}>
            {aiPlanLoading ? "Planning…" : "✨ AI Plan My Week"}
          </button>
          <button className="btn-secondary" onClick={onClearAll}>
            Clear All
          </button>
        </div>
      </div>
      {aiPlanError && <p className="form-error" style={{ marginBottom: 12 }}>{aiPlanError}</p>}
      <div className="planner-grid">
        <div className="grid-header" />
        {MEAL_TYPES.map((type) => (
          <div key={type} className="grid-header meal-type-label">
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
        ))}
        {DAYS.map((day) => (
          <div key={day} className="day-row">
            <div className="day-label">{day}</div>
            {MEAL_TYPES.map((type) => (
              <MealSlot
                key={day + type}
                day={day}
                mealType={type}
                meal={plan[day][type]}
                recipes={recipes}
                plan={plan}
                onAssign={onAssign}
                onClear={onClear}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
