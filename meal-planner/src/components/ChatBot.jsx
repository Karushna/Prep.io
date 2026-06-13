import { useState, useRef, useEffect } from "react";
import { DAYS, MEAL_TYPES } from "../data/recipes";
import { chatWithTools, generateRecipe } from "../services/openai";

const TOOLS = [
  {
    type: "function",
    function: {
      name: "assign_meal",
      description: "Assign a recipe from the library to a specific meal slot in the weekly plan.",
      parameters: {
        type: "object",
        properties: {
          day: { type: "string", enum: DAYS },
          meal_type: { type: "string", enum: MEAL_TYPES },
          recipe_id: { type: "string", description: "The id field of the recipe from the available recipes list" },
        },
        required: ["day", "meal_type", "recipe_id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "clear_meal",
      description: "Remove the meal from a specific day and meal type.",
      parameters: {
        type: "object",
        properties: {
          day: { type: "string", enum: DAYS },
          meal_type: { type: "string", enum: MEAL_TYPES },
        },
        required: ["day", "meal_type"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "clear_week",
      description: "Clear all meals from the entire week.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_recipe",
      description: "Generate a brand-new recipe from a description and save it to My Recipes. Only use this when the user explicitly asks for a new recipe or nothing in the library fits.",
      parameters: {
        type: "object",
        properties: {
          description: { type: "string", description: "Short description of the recipe to generate" },
        },
        required: ["description"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "navigate",
      description: "Navigate the user to a different section of the app.",
      parameters: {
        type: "object",
        properties: {
          tab: { type: "string", enum: ["home", "planner", "shopping", "recipes"] },
        },
        required: ["tab"],
        additionalProperties: false,
      },
    },
  },
];

function buildSystemPrompt(plan, allRecipes, shoppingList, weekDates) {
  const planLines = DAYS.map((dayName, i) => {
    const slots = MEAL_TYPES.map((type) => {
      const meal = plan[weekDates[i]]?.[type];
      return `${type}=${meal ? meal.name : "(empty)"}`;
    });
    return `  ${dayName} (${weekDates[i]}): ${slots.join(", ")}`;
  }).join("\n");

  const recipeList = allRecipes
    .map((r) => `  id=${r.id} | ${r.name} | ${r.category}${r.tags?.length ? ` | ${r.tags.join(",")}` : ""}`)
    .join("\n");

  const shoppingPreview =
    shoppingList.length > 0
      ? `${shoppingList.length} items — ${shoppingList
          .slice(0, 8)
          .map((i) => i.name)
          .join(", ")}${shoppingList.length > 8 ? "…" : ""}`
      : "empty";

  return `You are a concise and helpful meal planning assistant. You can read the user's weekly plan, recipe library, and shopping list — and you can take actions using the provided tools.

Current Weekly Plan:
${planLines}

Available Recipes (${allRecipes.length}):
${recipeList}

Shopping List: ${shoppingPreview}

Rules:
- Be brief and friendly
- Prefer assigning recipes from the library; only call generate_recipe when asked or when nothing fits
- You can call multiple tools in one response (e.g. assign several slots at once)
- After taking actions, briefly confirm what you did`;
}

const EXAMPLES = [
  "Plan my entire Monday",
  "Add a vegan dinner for Thursday",
  "What vegetarian recipes do I have?",
  "Clear all my dinners this week",
  "Show me my shopping list",
  "Generate a spicy tofu stir-fry recipe",
];

export default function ChatBot({ plan, allRecipes, shoppingList, weekDates, onAssignMeal, onClearMeal, onClearWeek, onAddRecipe, onNavigate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function executeTool(name, args) {
    try {
      if (name === "assign_meal") {
        const recipe = allRecipes.find((r) => String(r.id) === String(args.recipe_id));
        if (!recipe) return `Error: no recipe with id=${args.recipe_id}.`;
        const dateStr = weekDates[DAYS.indexOf(args.day)];
        if (!dateStr) return `Error: unknown day ${args.day}.`;
        onAssignMeal(dateStr, args.meal_type, recipe);
        return `Assigned "${recipe.name}" to ${args.day} (${dateStr}) ${args.meal_type}.`;
      }
      if (name === "clear_meal") {
        const dateStr = weekDates[DAYS.indexOf(args.day)];
        if (!dateStr) return `Error: unknown day ${args.day}.`;
        onClearMeal(dateStr, args.meal_type);
        return `Cleared ${args.day} ${args.meal_type}.`;
      }
      if (name === "clear_week") {
        onClearWeek(weekDates);
        return "Cleared all meals for this week.";
      }
      if (name === "generate_recipe") {
        const recipe = await generateRecipe(args.description);
        onAddRecipe(recipe);
        return `Generated and saved "${recipe.name}" (${recipe.category}).`;
      }
      if (name === "navigate") {
        onNavigate(args.tab);
        return `Navigated to ${args.tab}.`;
      }
      return `Unknown tool: ${name}`;
    } catch (e) {
      return `Error: ${e.message}`;
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError("");

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const systemPrompt = buildSystemPrompt(plan, allRecipes, shoppingList, weekDates);
      const apiMessages = [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: text },
      ];

      let choice = await chatWithTools(apiMessages, TOOLS);
      const confirmedActions = [];

      while (choice.finish_reason === "tool_calls") {
        const toolCalls = choice.message.tool_calls;
        apiMessages.push(choice.message);

        const results = await Promise.all(
          toolCalls.map(async (tc) => {
            const args = JSON.parse(tc.function.arguments);
            const result = await executeTool(tc.function.name, args);
            confirmedActions.push(result);
            return { role: "tool", tool_call_id: tc.id, content: result };
          })
        );

        apiMessages.push(...results);
        choice = await chatWithTools(apiMessages, TOOLS);
      }

      const assistantContent = choice.message.content ?? "";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantContent, actions: confirmedActions },
      ]);
    } catch (e) {
      setError(e.message);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-section">
      <div className="chat-messages">
        {messages.length === 0 && !loading && (
          <div className="chat-empty">
            <p className="chat-empty-title">Ask me anything about your meals</p>
            <div className="chat-examples">
              {EXAMPLES.map((ex) => (
                <button key={ex} className="chat-example-btn" onClick={() => setInput(ex)}>
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble-wrap ${msg.role}`}>
            <div className={`chat-bubble ${msg.role}`}>{msg.content}</div>
            {msg.actions?.length > 0 && (
              <div className="chat-actions">
                {msg.actions.map((action, j) => (
                  <span key={j} className="chat-action-tag">✓ {action}</span>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="chat-bubble-wrap assistant">
            <div className="chat-bubble assistant chat-bubble-loading">
              <span className="chat-dot" />
              <span className="chat-dot" />
              <span className="chat-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {error && <p className="form-error chat-error">{error}</p>}

      <div className="chat-input-row">
        <input
          className="form-input chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Ask about your meals, plan your week…"
          disabled={loading}
        />
        <button className="btn-primary" onClick={sendMessage} disabled={loading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
