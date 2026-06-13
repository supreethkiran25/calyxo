import { GRADIENTS } from "../theme/colors";

export const USER = {
  name: "Arjun",
  age: 24,
  weight: 72,
  height: 178,
  goal: "Muscle Gain",
  level: "Intermediate",
  streak: 14,
  xp: 3420,
  level_num: 7,
  avatar: "A",
  calories_goal: 2800,
  protein_goal: 160,
  water_goal: 3.5,
  bmi: 22.7,
  steps: 8234,
};

export const WORKOUTS_DB = [
  // CHEST
  { id: 1, name: "Bench Press", muscle: "Chest", sub: "Upper Chest", difficulty: "Intermediate", equipment: "Barbell", calories: 280, duration: 45, sets: 4, reps: "8-10", rest: "90s", goal: ["Strength", "Muscle Gain"], emoji: "🏋️", instructions: "Lie flat, grip bar shoulder-width, lower to chest, press explosively.", desc: "King of chest exercises. Builds raw upper body mass and pressing strength." },
  { id: 2, name: "Incline DB Press", muscle: "Chest", sub: "Upper Chest", difficulty: "Intermediate", equipment: "Dumbbell", calories: 240, duration: 40, sets: 4, reps: "10-12", rest: "75s", goal: ["Muscle Gain"], emoji: "💪", instructions: "Set bench 30-45°. Press dumbbells from shoulder height to lockout.", desc: "Targets upper pec fibers for a full, rounded chest appearance." },
  { id: 3, name: "Push-ups", muscle: "Chest", sub: "Full Chest", difficulty: "Beginner", equipment: "Bodyweight", calories: 180, duration: 20, sets: 3, reps: "15-20", rest: "60s", goal: ["Fat Loss", "Endurance"], emoji: "🤸", instructions: "Plank position, lower chest to floor, push back up. Keep core tight.", desc: "The ultimate bodyweight chest builder. Works anywhere, anytime." },
  { id: 4, name: "Cable Fly", muscle: "Chest", sub: "Inner Chest", difficulty: "Intermediate", equipment: "Cable", calories: 200, duration: 35, sets: 3, reps: "12-15", rest: "60s", goal: ["Muscle Gain"], emoji: "🔗", instructions: "Stand between cables, bring hands together in arc motion.", desc: "Constant tension throughout movement. Perfect for chest definition." },
  { id: 5, name: "Dips", muscle: "Chest", sub: "Lower Chest", difficulty: "Intermediate", equipment: "Bodyweight", calories: 220, duration: 30, sets: 3, reps: "10-15", rest: "75s", goal: ["Strength", "Muscle Gain"], emoji: "⬇️", instructions: "Grip bars, lean forward 30°, lower until elbows 90°, push up.", desc: "The squat of the upper body. Devastates lower chest and triceps." },
  { id: 101, name: "Decline Bench Press", muscle: "Chest", sub: "Lower Chest", difficulty: "Intermediate", equipment: "Barbell", calories: 270, duration: 40, sets: 4, reps: "8-12", rest: "90s", goal: ["Muscle Gain"], emoji: "📉", instructions: "Lie on decline bench, lower bar to lower chest.", desc: "Focuses on the lower pectoral muscles." },
  { id: 102, name: "Pec Deck Fly", muscle: "Chest", sub: "Inner Chest", difficulty: "Beginner", equipment: "Machine", calories: 180, duration: 30, sets: 3, reps: "12-15", rest: "60s", goal: ["Muscle Gain"], emoji: "🦋", instructions: "Sit in machine, push handles together in front of chest.", desc: "Great isolation for the pecs with a deep stretch." },

  // BACK
  { id: 6, name: "Pull-ups", muscle: "Back", sub: "Lats", difficulty: "Intermediate", equipment: "Bodyweight", calories: 260, duration: 30, sets: 4, reps: "8-12", rest: "90s", goal: ["Strength", "Muscle Gain"], emoji: "🧗", instructions: "Hang from bar, pull chest to bar, slow negative.", desc: "Best lat builder known to man. Wide grip = wide back." },
  { id: 7, name: "Deadlift", muscle: "Back", sub: "Full Back", difficulty: "Advanced", equipment: "Barbell", calories: 380, duration: 50, sets: 4, reps: "5-8", rest: "120s", goal: ["Strength"], emoji: "⚡", instructions: "Bar over mid-foot, hinge hips, drive through floor, lock hips at top.", desc: "The ultimate strength movement. Full posterior chain domination." },
  { id: 8, name: "Lat Pulldown", muscle: "Back", sub: "Lats", difficulty: "Beginner", equipment: "Cable", calories: 210, duration: 35, sets: 4, reps: "10-12", rest: "75s", goal: ["Muscle Gain"], emoji: "⬇️", instructions: "Grip wide, pull bar to upper chest, control the negative.", desc: "Perfect for beginners learning the lat pulldown movement pattern." },
  { id: 9, name: "Bent Over Row", muscle: "Back", sub: "Traps", difficulty: "Intermediate", equipment: "Barbell", calories: 300, duration: 40, sets: 4, reps: "8-10", rest: "90s", goal: ["Strength", "Muscle Gain"], emoji: "🏋️", instructions: "Hip hinge 45°, row bar to lower chest, squeeze shoulder blades.", desc: "Thick back builder. Targets mid-back, traps, and rear delts." },
  { id: 103, name: "T-Bar Row", muscle: "Back", sub: "Mid Back", difficulty: "Intermediate", equipment: "Barbell", calories: 290, duration: 40, sets: 4, reps: "10-12", rest: "90s", goal: ["Muscle Gain"], emoji: "🛶", instructions: "Straddle bar, use V-handle, pull towards abdomen.", desc: "Excellent for mid-back thickness and strength." },
  { id: 104, name: "Face Pulls", muscle: "Back", sub: "Rear Delts", difficulty: "Beginner", equipment: "Cable", calories: 150, duration: 25, sets: 3, reps: "15-20", rest: "60s", goal: ["Postural"], emoji: "💆", instructions: "Pull rope towards face, pulling ends apart at the finish.", desc: "Crucial for shoulder health and rear delt development." },

  // SHOULDERS
  { id: 10, name: "Overhead Press", muscle: "Shoulders", sub: "Front Delts", difficulty: "Intermediate", equipment: "Barbell", calories: 260, duration: 40, sets: 4, reps: "6-8", rest: "90s", goal: ["Strength", "Muscle Gain"], emoji: "🏋️", instructions: "Press bar from collarbone overhead, lock arms, lower controlled.", desc: "The shoulder strength standard. Builds massive front delts." },
  { id: 11, name: "Lateral Raise", muscle: "Shoulders", sub: "Side Delts", difficulty: "Beginner", equipment: "Dumbbell", calories: 160, duration: 25, sets: 3, reps: "15-20", rest: "60s", goal: ["Muscle Gain"], emoji: "🦅", instructions: "Arms slightly bent, raise to shoulder height, control down.", desc: "Shoulder width builder. Makes your V-taper undeniable." },
  { id: 12, name: "Arnold Press", muscle: "Shoulders", sub: "Front Delts", difficulty: "Intermediate", equipment: "Dumbbell", calories: 220, duration: 35, sets: 4, reps: "10-12", rest: "75s", goal: ["Muscle Gain"], emoji: "🦾", instructions: "Start with palms facing you, rotate palms outward as you press up.", desc: "Named after Schwarzenegger, hits all three delt heads." },

  // LEGS
  { id: 13, name: "Barbell Squat", muscle: "Legs", sub: "Quads", difficulty: "Intermediate", equipment: "Barbell", calories: 400, duration: 50, sets: 4, reps: "6-10", rest: "120s", goal: ["Strength", "Muscle Gain"], emoji: "🦵", instructions: "Bar on traps, squat below parallel, drive through heels to stand.", desc: "The king of leg exercises. Non-negotiable for size and strength." },
  { id: 14, name: "Romanian Deadlift", muscle: "Legs", sub: "Hamstrings", difficulty: "Intermediate", equipment: "Barbell", calories: 320, duration: 40, sets: 4, reps: "8-12", rest: "90s", goal: ["Muscle Gain"], emoji: "🏋️", instructions: "Hip hinge keeping bar close, feel hamstring stretch, snap hips forward.", desc: "Hamstring hypertrophy master. Feel the deep stretch on every rep." },
  { id: 15, name: "Leg Press", muscle: "Legs", sub: "Quads", difficulty: "Beginner", equipment: "Machine", calories: 280, duration: 35, sets: 4, reps: "10-15", rest: "90s", goal: ["Muscle Gain"], emoji: "🦾", instructions: "Feet shoulder width on platform, lower until 90°, press through heels.", desc: "Load up heavy with less lower back stress. Quad isolation master." },
  { id: 16, name: "Hip Thrust", muscle: "Legs", sub: "Glutes", difficulty: "Beginner", equipment: "Barbell", calories: 240, duration: 35, sets: 4, reps: "12-15", rest: "75s", goal: ["Muscle Gain"], emoji: "🍑", instructions: "Shoulders on bench, bar on hips, thrust up squeezing glutes hard.", desc: "The #1 glute builder. Science-backed for maximum glute activation." },

  // ARMS
  { id: 17, name: "Barbell Curl", muscle: "Arms", sub: "Biceps", difficulty: "Beginner", equipment: "Barbell", calories: 160, duration: 25, sets: 3, reps: "10-12", rest: "60s", goal: ["Muscle Gain"], emoji: "💪", instructions: "Elbows fixed at sides, curl to shoulder, squeeze at top, lower slow.", desc: "Classic bicep builder. The curl every lifter loves to do." },
  { id: 18, name: "Tricep Pushdown", muscle: "Arms", sub: "Triceps", difficulty: "Beginner", equipment: "Cable", calories: 150, duration: 25, sets: 3, reps: "12-15", rest: "60s", goal: ["Muscle Gain"], emoji: "⬇️", instructions: "Elbows at sides, push rope down fully extending, control up.", desc: "Triceps are 2/3 of arm size. Make them a priority." },
  { id: 19, name: "Skull Crushers", muscle: "Arms", sub: "Triceps", difficulty: "Intermediate", equipment: "EZ Bar", calories: 170, duration: 30, sets: 3, reps: "10-12", rest: "75s", goal: ["Muscle Gain"], emoji: "💀", instructions: "Lie flat, lower bar to forehead by bending elbows, extend back up.", desc: "Ultimate tricep mass builder targeting the long head." },

  // CORE
  { id: 20, name: "Plank", muscle: "Core", sub: "Full Core", difficulty: "Beginner", equipment: "Bodyweight", calories: 120, duration: 15, sets: 3, reps: "60s hold", rest: "45s", goal: ["Endurance", "Fat Loss"], emoji: "🏗️", instructions: "Forearms on floor, body straight, hold tight without sagging hips.", desc: "The foundation of all core work. Do it every single day." },
  { id: 21, name: "Cable Crunch", muscle: "Core", sub: "Upper Abs", difficulty: "Beginner", equipment: "Cable", calories: 150, duration: 20, sets: 3, reps: "15-20", rest: "60s", goal: ["Muscle Gain", "Fat Loss"], emoji: "🔗", instructions: "Kneel, rope behind head, crunch down bringing elbows to knees.", desc: "Weighted ab work builds visible, strong abs fast." },
  { id: 22, name: "Russian Twists", muscle: "Core", sub: "Obliques", difficulty: "Beginner", equipment: "Dumbbell", calories: 140, duration: 20, sets: 3, reps: "20 reps", rest: "45s", goal: ["Fat Loss"], emoji: "🌪️", instructions: "Sit on floor, knees bent, rotate torso from side to side holding weight.", desc: "Targets the obliques for a tapered waistline." },

  // HIIT/CARDIO
  { id: 23, name: "HIIT Sprint", muscle: "Full Body", sub: "Cardio", difficulty: "Advanced", equipment: "None", calories: 450, duration: 25, sets: 8, reps: "30s on/30s off", rest: "30s", goal: ["Fat Loss", "Endurance"], emoji: "🏃", instructions: "Sprint all-out for 30s, rest 30s. Repeat 8 rounds.", desc: "The most efficient fat-burning protocol on earth. Zero excuses." },
  { id: 24, name: "Burpees", muscle: "Full Body", sub: "HIIT", difficulty: "Advanced", equipment: "Bodyweight", calories: 500, duration: 20, sets: 5, reps: "15 reps", rest: "60s", goal: ["Fat Loss", "Athletic"], emoji: "💥", instructions: "Drop to floor, push up, jump up with hands overhead. No breaks.", desc: "The most brutal full-body conditioning exercise. Love to hate it." },
];

export const NUTRITION_DB = [
  { id: 1, name: "Chicken Breast (100g)", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, category: "Protein" },
  { id: 2, name: "Brown Rice (1 cup cooked)", calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, category: "Carbs" },
  { id: 3, name: "Whole Eggs (2)", calories: 156, protein: 12, carbs: 1.2, fat: 11, fiber: 0, category: "Protein" },
  { id: 4, name: "Oats (50g)", calories: 189, protein: 6.5, carbs: 32, fat: 3.5, fiber: 5, category: "Carbs" },
  { id: 5, name: "Banana (medium)", calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, category: "Fruit" },
  { id: 6, name: "Greek Yogurt (150g)", calories: 130, protein: 17, carbs: 9, fat: 0, fiber: 0, category: "Protein" },
  { id: 7, name: "Masala Dal (1 bowl)", calories: 230, protein: 12, carbs: 38, fat: 3, fiber: 8, category: "Indian" },
  { id: 8, name: "Paneer (100g)", calories: 265, protein: 18, carbs: 3.6, fat: 20, fiber: 0, category: "Indian" },
  { id: 9, name: "Idli (2 pieces)", calories: 116, protein: 4, carbs: 22, fat: 0.5, fiber: 1.5, category: "South Indian" },
  { id: 10, name: "Whey Protein (30g)", calories: 120, protein: 24, carbs: 3, fat: 1.5, fiber: 0, category: "Supplement" },
];

export const CHALLENGES = [
  { id: 1, title: "30-Day Push-up Challenge", desc: "From 10 to 100 push-ups", icon: "💪", progress: 14, total: 30, xp: 500, color: GRADIENTS.green },
  { id: 2, title: "10K Steps Daily", desc: "Walk 10,000 steps every day for a week", icon: "🚶", progress: 5, total: 7, xp: 200, color: GRADIENTS.blue },
  { id: 3, title: "No Sugar Week", desc: "Cut refined sugar for 7 days", icon: "🚫", progress: 3, total: 7, xp: 300, color: GRADIENTS.fire },
  { id: 4, title: "Hydration Hero", desc: "Drink 3.5L water daily for 5 days", icon: "💧", progress: 4, total: 5, xp: 150, color: GRADIENTS.teal },
];

export const BADGES = [
  { id: 1, name: "First Blood", desc: "Completed first workout", icon: "🩸", earned: true },
  { id: 2, name: "Week Warrior", desc: "7-day workout streak", icon: "⚔️", earned: true },
  { id: 3, name: "Iron Will", desc: "14-day workout streak", icon: "🦾", earned: true },
  { id: 4, name: "Century Club", desc: "100 total workouts", icon: "💯", earned: false },
  { id: 5, name: "Beast Mode", desc: "Burn 500+ cal in one session", icon: "🔥", earned: true },
  { id: 6, name: "Consistency King", desc: "30-day streak", icon: "👑", earned: false },
];

export const AI_MESSAGES = [
  { role: "assistant", text: "Hey Arjun! 💪 You're on a 14-day streak — that's elite dedication. Today's focus: Upper Push (Chest + Shoulders + Triceps). You're 72kg, aiming for muscle gain. I'll keep protein targets high. Ready to crush it?", time: "now" },
];

export const SUGGESTED_PROMPTS = [
  "Build me a 6-day PPL split",
  "What should I eat for muscle gain at 72kg?",
  "How many calories do I burn in 45min of lifting?",
  "Give me a 20-min morning HIIT routine",
  "Best foods for post-workout recovery?",
  "Design my meal prep for this week",
];

export const PROGRESS_DATA = [
  { week: "W1", weight: 71.2, calories: 2650, workouts: 5 },
  { week: "W2", weight: 71.5, calories: 2720, workouts: 6 },
  { week: "W3", weight: 71.8, calories: 2780, workouts: 5 },
  { week: "W4", weight: 72.0, calories: 2800, workouts: 6 },
  { week: "W5", weight: 72.3, calories: 2850, workouts: 6 },
  { week: "W6", weight: 72.1, calories: 2790, workouts: 4 },
  { week: "W7", weight: 72.5, calories: 2820, workouts: 7 },
];

export const COACH_PERSONALITIES = [
  { id: "hardcore", name: "Hardcore", icon: "🔥", desc: "No excuses. Pure pain.", color: GRADIENTS.fire },
  { id: "friendly", name: "Friendly", icon: "😊", desc: "Your supportive BFF", color: GRADIENTS.green },
  { id: "scientific", name: "Scientific", icon: "🧬", desc: "Data-driven coaching", color: GRADIENTS.blue },
  { id: "discipline", name: "Discipline", icon: "⚔️", desc: "Military precision", color: GRADIENTS.purple },
  { id: "beginner", name: "Beginner", icon: "🌱", desc: "Patient & clear", color: GRADIENTS.teal },
];
