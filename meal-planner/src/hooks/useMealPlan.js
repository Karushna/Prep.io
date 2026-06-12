import { useState, useEffect } from "react";
import { DAYS, MEAL_TYPES } from "../data/recipes";

const emptyPlan = () =>
  Object.fromEntries(
    DAYS.map((day) => [day, Object.fromEntries(MEAL_TYPES.map((type) => [type, null]))])
  );

export function useMealPlan() {
  const [plan, setPlan] = useState(() => {
    try {
      const saved = localStorage.getItem("mealPlan");
      return saved ? JSON.parse(saved) : emptyPlan();
    } catch {
      return emptyPlan();
    }
  });

  useEffect(() => {
    localStorage.setItem("mealPlan", JSON.stringify(plan));
  }, [plan]);

  function assignMeal(day, mealType, recipe) {
    setPlan((prev) => ({
      ...prev,
      [day]: { ...prev[day], [mealType]: recipe },
    }));
  }

  function clearMeal(day, mealType) {
    setPlan((prev) => ({
      ...prev,
      [day]: { ...prev[day], [mealType]: null },
    }));
  }

  function clearAll() {
    setPlan(emptyPlan());
  }

  function getShoppingList() {
    const ingredientMap = {};
    for (const day of DAYS) {
      for (const type of MEAL_TYPES) {
        const recipe = plan[day][type];
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

  return { plan, assignMeal, clearMeal, clearAll, getShoppingList };
}
