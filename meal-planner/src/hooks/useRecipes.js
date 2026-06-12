import { useState } from "react";
import { recipes as builtInRecipes } from "../data/recipes";

const STORAGE_KEY = "customRecipes";

function loadCustom() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function useRecipes() {
  const [customRecipes, setCustomRecipes] = useState(loadCustom);

  const allRecipes = [...builtInRecipes, ...customRecipes];

  function addRecipe(recipe) {
    const newRecipe = { ...recipe, id: "custom_" + Date.now(), isCustom: true };
    setCustomRecipes((prev) => {
      const next = [...prev, newRecipe];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    return newRecipe;
  }

  function updateRecipe(id, updates) {
    setCustomRecipes((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ...updates } : r));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function deleteRecipe(id) {
    setCustomRecipes((prev) => {
      const next = prev.filter((r) => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return { allRecipes, customRecipes, addRecipe, updateRecipe, deleteRecipe };
}
