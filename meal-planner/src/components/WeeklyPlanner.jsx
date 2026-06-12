import MealSlot from "./MealSlot";
import { DAYS, MEAL_TYPES } from "../data/recipes";

export default function WeeklyPlanner({ plan, recipes, onAssign, onClear, onClearAll }) {
  return (
    <div className="planner-section">
      <div className="section-header">
        <h2>Weekly Meal Plan</h2>
        <button className="btn-secondary" onClick={onClearAll}>
          Clear All
        </button>
      </div>
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
