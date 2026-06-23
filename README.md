# 🥗 Prep.io - AI-Powered Meal Planning

> **Smart meal planning made simple.** Plan your entire week's meals, generate intelligent shopping lists, and discover recipes based on available ingredients, all powered by AI.

---

## 📹 Demo

Watch Prep.io in action:

[![Prep.io Demo](https://img.youtube.com/vi/jYk5aUekjRg/0.jpg)](https://www.youtube.com/watch?v=jYk5aUekjRg)

**[Full Demo on YouTube](https://www.youtube.com/watch?v=jYk5aUekjRg)** - See meal planning, AI suggestions, shopping lists, and nutritional tracking in action!

---

## ✨ Features

### 🍽️ Weekly Meal Planner
- **7-day visual calendar** with breakfast, lunch, and dinner slots
- **Click-to-assign** meals from your recipe library
- **Week navigation** with previous/next controls
- **One-click week clearing** for fresh planning
- **Persistent storage** - plans saved automatically to your browser

### 🤖 AI-Powered Meal Planning
- **Auto-fill empty meals** with a single click
- **Intelligent algorithm** that:
  - Avoids recipe repetition throughout the week
  - Matches recipe categories to meal types
  - Considers dietary preferences (vegan, vegetarian, gluten-free, dairy-free)
- **Powered by GPT-4o-mini** for smart recommendations

### 🧂 Ingredient-Based Recipe Search
- **"Fridge scan" feature** - Enter available ingredients
- **Find matching recipes** from your library (50%+ ingredient overlap)
- **Shows missing ingredients** per recipe
- **AI-generated recipe suggestions** using your ingredients
- **Auto-save** new recipes to your library

### 🛒 Smart Shopping Lists
- **Auto-generated** from your weekly meal plan
- **Ingredient aggregation** - combines items across multiple recipes
- **Usage tracking** - shows which recipe, day, and meal type needs each ingredient
- **Checkbox shopping** - check off items as you shop
- **Persistent state** - your progress is saved

### 📖 Recipe Management
- **Build your library** with custom recipes
- **Full CRUD operations** - Create, Read, Update, Delete recipes
- **Rich metadata** - name, category, cooking time, servings, ingredients
- **Dietary tags** - vegan, vegetarian, gluten-free, dairy-free
- **Edit anytime** - modify recipes on the fly

### 📊 Nutritional Dashboard
- **Weekly nutrition analysis** for your entire meal plan
- **AI-estimated macronutrients**:
  - Total calories per week and per day average
  - Protein, carbohydrates, and fat totals
- **Coverage metrics** - how many meals you've planned vs. total
- **Smart caching** - minimizes API calls

### 💬 Interactive ChatBot
- **Conversational interface** for natural meal planning
- **Real-time plan updates** through chat commands
- **Today's meal preview** - sidebar showing current day's assignments
- **Voice-like commands** - "Plan my week", "Add pasta to lunch"

---

## 🛠️ Tech Stack

### Frontend
- **React 19.2.6** - UI library with hooks
- **Vite 8.0.12** - Lightning-fast build tool with HMR
- **CSS3** - Responsive design with CSS Grid, Flexbox, and CSS Variables
- **JavaScript ES Modules** - Modern module system

### State Management
- **React Hooks** - `useState`, `useEffect` for state and side effects
- **Custom Hooks** - `useMealPlan`, `useRecipes` for encapsulated logic
- **Browser localStorage** - Automatic data persistence without backend

### AI & APIs
- **OpenAI API** - GPT-4o-mini model for intelligent meal planning
- **JSON Schema** - Structured responses from AI model
- **Fetch API** - Making HTTP requests to OpenAI

### Development
- **ESLint** - Code quality and best practices
- **Node.js** - Runtime environment
- **npm** - Package management

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16+) and npm installed
- **OpenAI API key** - Get one at [platform.openai.com](https://platform.openai.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/prep-io.git
   cd prep-io/meal-planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your OpenAI API key:
   ```env
   VITE_OPENAI_API_KEY=sk_test_your_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:5173](http://localhost:5173) in your browser

5. **Build for production**
   ```bash
   npm run build
   ```
   
   The optimized build will be in `dist/`

---

## 📖 Usage

### Planning Your Week

1. **Go to Weekly Plan** (📅 tab)
2. **Browse available recipes** or add your own
3. **Click on a meal slot** to assign a recipe
4. **Use AI Plan button** to auto-fill empty meals
5. **Navigate weeks** with arrow buttons

### Building Your Recipe Library

1. **Go to My Recipes** (🍴 tab)
2. **Click "Add New Recipe"**
3. **Fill in details**: name, category, cooking time, ingredients
4. **Add dietary tags** (optional)
5. **Save** - recipe appears in your library

### Using the Fridge Scan

1. **On Home page**, find "What can I make?" section
2. **Type your ingredients**: "chicken, garlic, lemon, pasta"
3. **Click "Find Recipes"**
4. **Browse matching recipes** and missing ingredients
5. **Save AI suggestions** to your library

### Generating Shopping Lists

1. **Plan your meals** for the week
2. **Go to Shopping List** (🛒 tab)
3. **View all ingredients** aggregated from your meals
4. **Check off items** as you shop
5. **Export or print** if needed

### Nutrition Analysis

1. **Plan your meals** for the week
2. **Click "Calculate"** in the Nutrition Dashboard
3. **Review weekly totals**: calories, protein, carbs, fat
4. **See meal coverage**: how many meals you've planned

---
## 🧠 How It Works

### State Management Architecture

```
React Component
    ↓
Custom Hook (useMealPlan / useRecipes)
    ↓
useState for state management
    ↓
useEffect for localStorage sync
    ↓
JSON serialization in browser storage
```

### AI Integration Flow

```
User Action
    ↓
Collect necessary data (recipes, current plan, ingredients)
    ↓
Format as JSON and send to OpenAI API
    ↓
GPT-4o-mini processes with detailed prompt
    ↓
Receive structured JSON response
    ↓
Parse and apply to meal plan / recipes
```

### Shopping List Generation

```
Loop through all planned meals this week
    ↓
Extract ingredients from each recipe
    ↓
Aggregate by ingredient name (normalized)
    ↓
Track usage: which recipe, day, meal type
    ↓
Sort alphabetically and display with metadata
```

---

## 🔌 API Integration

### OpenAI API Usage

Prep.io uses OpenAI's GPT-4o-mini model for:

**1. Meal Week Planning**
```javascript
planWeek(recipes, currentPlan, days, mealTypes)
// Fills empty meal slots intelligently
```

**2. Recipe Generation from Ingredients**
```javascript
suggestFromIngredients(ingredientList, recipes)
// Finds matching recipes and suggests new ones
```

**3. Nutrition Estimation**
```javascript
estimateNutrition(recipe)
// Calculates macro nutrients per serving
```

**4. Chat Interface**
```javascript
chatWithTools(messages, tools)
// Conversational meal planning with tool use
```

### Configuration

Set your API key in `.env.local`:
```env
VITE_OPENAI_API_KEY=sk_your_key_here
```

**Cost Optimization Tips:**
- Nutrition is cached per recipe to avoid duplicate calls
- Batch requests where possible (meal planning fills multiple slots at once)
- Consider your OpenAI billing limits

---

## 📱 Browser Support

- **Chrome/Edge** 90+
- **Firefox** 88+
- **Safari** 14+
- **Mobile browsers** (iOS Safari, Chrome Mobile)

**Note:** Requires localStorage support (all modern browsers)

---

## 🚧 Development

### Running in Development Mode

```bash
npm run dev
```

- Hot Module Replacement (HMR) enabled
- Code changes reflect instantly
- ESLint runs on save

### Linting

```bash
npm run lint
```

Checks code quality and React best practices.

### Building for Production

```bash
npm run build
```

- Optimized bundle (~50KB gzipped)
- CSS and JS minified
- Assets optimized
- Ready to deploy to Vercel, Netlify, GitHub Pages, etc.

### Preview Production Build

```bash
npm run preview
```

Test the production build locally before deploying.

---

## 🎯 Key Features Breakdown

### Meal Planning Algorithm

The AI meal planning intelligently:
- ✅ Avoids repeating recipes within the week
- ✅ Matches recipe categories to meal types (breakfast → breakfast recipes)
- ✅ Considers dietary tags for variety
- ✅ Fills empty slots optimally

**Prompt Constraint Example:**
```
Fill empty meal slots using recipes from the provided list.
Rules: match recipe category to slot type (breakfast→breakfast, etc.), 
avoid repeating the same recipe, vary dietary tags across the week.
```

### Shopping List Deduplication

Intelligently combines ingredients:
- Normalizes ingredient names (lowercase comparison)
- Tracks all usages (recipe, day, meal type)
- Preserves original casing for display
- Sorts alphabetically

### Data Persistence

All data stored in browser localStorage:
- **mealPlan**: Weekly meal assignments
- **customRecipes**: User-created recipes
- **shoppingChecked**: Checkbox state for shopping list

**Benefits:**
- No backend required
- Offline functionality
- Instant data access
- No privacy concerns (all local)

---

## 🔒 Data & Privacy

- **No backend server** - all data stays on your device
- **localStorage only** - data stored in your browser
- **OpenAI API calls** only for AI features (meal planning, nutrition, recipes)
- **Read [OpenAI privacy policy](https://openai.com/privacy/)** for API usage

---

## 📊 Performance Optimizations

- **Lazy state initialization** - Load from localStorage only once
- **Derived state pattern** - Shopping lists calculated on-demand
- **Nutrition caching** - Avoid redundant API calls for same recipes
- **Date normalization** - Use ISO 8601 format for consistency
- **Batch API requests** - Fill multiple meal slots in one call

---

## 🐛 Known Limitations

- Nutrition estimates are AI-generated and approximate
- Requires OpenAI API key (costs ~$0.01-0.05 per meal plan generation)
- No cloud sync across devices (localStorage is local-only)
- No native mobile app yet (web app is responsive)
- AI responses are non-deterministic (same ingredients may suggest different recipes)

---

## 🚀 Roadmap

### v1.1 (Upcoming)
- [ ] TypeScript migration for type safety
- [ ] User authentication and cloud sync
- [ ] Recipe sharing between users
- [ ] Advanced dietary restriction profiles
- [ ] Dark mode theme

### v1.2
- [ ] Mobile app (React Native)
- [ ] Voice input support
- [ ] Photo recipe recognition
- [ ] Integration with grocery delivery services
- [ ] Barcode scanning for shopping

### v2.0
- [ ] Backend with PostgreSQL
- [ ] Multi-user meal planning (families)
- [ ] Budget-aware meal planning
- [ ] Social recipe marketplace
- [ ] Apple Health / MyFitnessPal integration

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/prep-io.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**
   - Describe your changes clearly
   - Include any new features or bug fixes
   - Reference related issues

### Development Guidelines
- Follow React best practices and hooks patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Test across browsers
- Keep components focused and reusable
