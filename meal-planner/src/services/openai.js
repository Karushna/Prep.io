const BASE = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

async function chat(messages) {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  if (!key) throw new Error("Add VITE_OPENAI_API_KEY to your .env file.");
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: MODEL, messages, response_format: { type: "json_object" } }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message ?? `API error ${res.status}`);
  }
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

export async function generateRecipe(prompt) {
  return chat([
    {
      role: "system",
      content: `Generate a recipe based on the user's description. Return JSON exactly:
{"name":string,"category":"breakfast"|"lunch"|"dinner","tags":array of zero or more from ["vegan","vegetarian","gluten-free","dairy-free"],"cookTime":number,"servings":number,"ingredients":[{"name":string,"amount":string}]}`,
    },
    { role: "user", content: prompt },
  ]);
}

export async function planWeek(recipes, currentPlan, days, mealTypes) {
  const emptySlots = [];
  days.forEach((day) => {
    mealTypes.forEach((type) => {
      if (!currentPlan[day][type]) emptySlots.push({ day, type });
    });
  });
  if (emptySlots.length === 0) return { assignments: [] };

  const recipeList = recipes.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    tags: r.tags ?? [],
  }));

  return chat([
    {
      role: "system",
      content: `Fill empty meal slots using recipes from the provided list. Rules: match recipe category to slot type (breakfast→breakfast, etc.), avoid repeating the same recipe, vary dietary tags across the week. Return JSON: {"assignments":[{"day":string,"type":string,"recipeId":string|number}]}`,
    },
    {
      role: "user",
      content: `Recipes: ${JSON.stringify(recipeList)}\nEmpty slots: ${JSON.stringify(emptySlots)}`,
    },
  ]);
}

export async function suggestFromIngredients(ingredientList, recipes) {
  const recipeList = recipes.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    ingredients: r.ingredients.map((i) => i.name),
  }));

  return chat([
    {
      role: "system",
      content: `Given the user's available ingredients, find recipes they can make (include if they have at least half the ingredients) and optionally suggest one new recipe using those ingredients. Sort matches by fewest missing ingredients first. Return JSON:
{"matches":[{"recipeId":string|number,"missing":string[]}],"suggestion":{"name":string,"category":"breakfast"|"lunch"|"dinner","tags":[],"cookTime":number,"servings":number,"ingredients":[{"name":string,"amount":string}]}|null}`,
    },
    {
      role: "user",
      content: `My ingredients: ${ingredientList}\nRecipes: ${JSON.stringify(recipeList)}`,
    },
  ]);
}

export async function organizeShoppingList(items) {
  return chat([
    {
      role: "system",
      content: `Categorize grocery items by store section. Use sections: Produce, Dairy & Eggs, Meat & Seafood, Bakery, Canned & Dry Goods, Frozen, Condiments & Spices, Other. Every item must appear in exactly one section. Return JSON: {"categories":[{"section":string,"items":string[]}]}`,
    },
    {
      role: "user",
      content: `Items: ${items.map((i) => i.name).join(", ")}`,
    },
  ]);
}

export async function chatWithTools(messages, tools) {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  if (!key) throw new Error("Add VITE_OPENAI_API_KEY to your .env file.");
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: MODEL, messages, tools, tool_choice: "auto" }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message ?? `API error ${res.status}`);
  }
  const data = await res.json();
  return data.choices[0];
}

export async function estimateNutrition(recipe) {
  return chat([
    {
      role: "system",
      content: `Estimate nutrition per serving for the recipe. Return JSON: {"calories":number,"protein":string,"carbs":string,"fat":string} (use "g" suffix for macros, e.g. "25g").`,
    },
    {
      role: "user",
      content: `Recipe: ${recipe.name}, serves ${recipe.servings ?? 4}\nIngredients: ${recipe.ingredients.map((i) => `${i.amount} ${i.name}`).join(", ")}`,
    },
  ]);
}
