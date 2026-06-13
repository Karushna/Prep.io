import { useState, useEffect } from "react";
import { MEAL_TYPES } from "../data/recipes";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function getMonday(d) {
  const dt = new Date(d);
  const day = dt.getDay();
  dt.setDate(dt.getDate() - day + (day === 0 ? -6 : 1));
  dt.setHours(0, 0, 0, 0);
  return dt;
}

export function getWeekDates(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

function isOldFormat(parsed) {
  return parsed && typeof parsed === "object" && DAY_NAMES.some((name) => name in parsed);
}

function emptyDay() {
  return Object.fromEntries(MEAL_TYPES.map((t) => [t, null]));
}

export function useMealPlan() {
  const [plan, setPlan] = useState(() => {
    try {
      const saved = localStorage.getItem("mealPlan");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (isOldFormat(parsed)) return {};
        return parsed && typeof parsed === "object" ? parsed : {};
      }
    } catch {
      // fall through
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem("mealPlan", JSON.stringify(plan));
  }, [plan]);

  function assignMeal(dateStr, mealType, recipe) {
    setPlan((prev) => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] ?? emptyDay()), [mealType]: recipe },
    }));
  }

  function clearMeal(dateStr, mealType) {
    setPlan((prev) => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] ?? emptyDay()), [mealType]: null },
    }));
  }

  function clearWeek(weekDates) {
    setPlan((prev) => {
      const next = { ...prev };
      weekDates.forEach((d) => delete next[d]);
      return next;
    });
  }

  function getShoppingList(weekDates) {
    const ingredientMap = {};
    for (const dateStr of weekDates) {
      const dayPlan = plan[dateStr] ?? {};
      for (const type of MEAL_TYPES) {
        const recipe = dayPlan[type];
        if (!recipe) continue;
        for (const ing of recipe.ingredients) {
          const key = ing.name.toLowerCase();
          if (!ingredientMap[key]) {
            ingredientMap[key] = { name: ing.name, amounts: [] };
          }
          ingredientMap[key].amounts.push({ amount: ing.amount, recipe: recipe.name });
        }
      }
    }
    return Object.values(ingredientMap).sort((a, b) => a.name.localeCompare(b.name));
  }

  return { plan, assignMeal, clearMeal, clearWeek, getShoppingList };
}
