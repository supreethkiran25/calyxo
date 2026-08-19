# Calyxo ⚡

Calyxo is a premium, modern, and fully responsive **AI-powered Fitness & Diet Coach Web Application** built with React, Vite, Supabase, and Google's Gemini Pro API. Featuring a striking dark/light theme, glassmorphic UI panels, and interactive trackers, Calyxo helps you log metrics, plan nutrition, track workouts, and consult a tailored AI coach trained on your own biometrics.

---

## Key Features 🚀

### 1. 🤖 Embedded AI Coach Concierge (`AICoach.js`)
* **Dynamic Viewport Height**: Fully responsive container utilizing `100dvh` for a flawless mobile chat interface that clears headers and navigation bars.
* **Consultation History Drawer**: Sidebar showing persistent, multi-thread chat sessions saved to Supabase (with fallback local caching).
* **Context-Aware RAG (Retrieval-Augmented Generation)**: The AI is dynamically loaded with your active biometrics, BMI, daily calorie intakes, water history, logged food items, and active workout schedules.
* **Few-Shot Training logs**: Highly-rated responses from the user are matched and fed back into the Gemini prompt automatically to calibrate tone and details.
* **Implicit Send Controls**: Clear neon-themed action button featuring both "Send" text and Lucide icons.

### 2. 📊 Daily Dashboard (`Dashboard.js`)
* **Interactive Calorie Ring**: Dynamic SVG donut tracker calculating consumed calories, active workout burns, and remaining targets.
* **Biometric Indices Summary**: Readouts for BMI (with status-specific colors), BMR (Basal Metabolic Rate), TDEE (Total Daily Energy Expenditure), and intake targets.
* **Hydration Tracker**: Animated water bottle visualization displaying hydration progress percentage with customizable logging increments.
* **Recent Timelines**: Glancable, responsive grid showing recent meals, active workouts, and weight progress sparklines.

### 3. 🍽️ Smart Food Diary (`FoodTracker.js`)
* **OpenFoodFacts Integration**: Search thousands of items on the OpenFoodFacts API with fallback autocomplete.
* **Calyxo Compatibility Score**: Algorithm evaluating a food item's density, carbs, fats, protein, and sugars against your specific biometric constraints (e.g. weight loss vs gains) to output a compatibility rating.
* **Weekly Planner**: Interactive calendar split for breakfast, lunch, and dinner recommendation presets.

### 4. 💪 Active Workout Logger (`WorkoutLogger.js`)
* **wger Database Search**: Look up standard exercise nomenclature dynamically.
* **Split Schedules**: Edit recommended split templates (Push, Pull, Legs, Recovery) directly on the interface.
* **Comprehensive Stats**: Track logs by sets, reps, weights, or cardio duration.

### 5. ⚖️ Dedicated User Profile (`UserProfile.js`)
* **Unified Settings**: Configure gender, age, activity level, metric/imperial unit systems, and weight/height values.
* **Calculated Macronutrients**: Tailored daily protein, carb, and fat targets based on your calculated active energy output.

---

## Technology Stack 🛠️

* **Framework**: React / Vite
* **Runtime**: React 19 / React DOM 19
* **Styling**: Tailwind CSS v4 & PostCSS (Neon Design System, Glassmorphic effects, responsive layout grids)
* **Icons**: Lucide React
* **State Management**: Zustand (Shared client store with persisters)
* **Backend Database & Authentication**: Supabase (`@supabase/supabase-js`)
* **AI Model Engine**: Google Gemini REST API (`gemini-2.5-flash`)

---

## Getting Started ⚙️

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 2. Environment Configurations
Create a `.env.local` file in the root directory and configure the following:

```env
# Gemini AI API Configuration
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Supabase API Configurations
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```
*(If Supabase configurations are left blank, Calyxo will automatically activate its internal **Mock Mode**, caching all data and logs inside the browser's LocalStorage).*

### 3. Local Installation & Development

```bash
# Install dependencies
npm install

# Run local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your web browser to access Calyxo.

### 4. Production Build & Preview

```bash
# Compile and build production optimized bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Directory Architecture 📁

```text
calyxo/
├── public/                # Static assets, branding, logos
├── src/
│   ├── api/
│   │   ├── export-logs/ route for jsonl fine-tuning exports
│   │   ├── food/        OpenFoodFacts query proxy
│   │   ├── gemini/      Gemini API RAG proxy
│   │   └── workout/     wger API query proxy
│   ├── components/        # Isolated modular React components
│   ├── lib/
│   │   ├── dbService.js   Unified database operations & local fallback cache
│   │   └── supabaseClient.js Supabase client connection setup
│   └── store/
│       └── useStore.js    Zustand state store
├── package.json
└── README.md
```
