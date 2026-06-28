import { getWorkoutLogs, getFoodLogs } from "./dbService";

/**
 * Fetches the user's most recent workout and formats it into a shareable card payload.
 */
export const generateWorkoutPostData = async (userId) => {
  if (!userId) return null;
  
  try {
    const workouts = await getWorkoutLogs(userId);
    if (!workouts || workouts.length === 0) return null;
    
    // Sort by most recent
    const sorted = workouts.sort((a, b) => b.timestamp - a.timestamp);
    const recent = sorted[0];

    return {
      id: recent.id,
      title: recent.name || "Workout",
      duration: recent.duration || 0,
      caloriesBurned: recent.caloriesBurned || 0,
      exercises: recent.exercises ? recent.exercises.map(e => e.name) : [],
      sets: recent.exercises ? recent.exercises.reduce((acc, curr) => acc + (curr.sets || 0), 0) : 0,
      reps: recent.exercises ? recent.exercises.reduce((acc, curr) => acc + (curr.reps || 0), 0) : 0,
      volume: recent.volume || 0,
      difficulty: recent.difficulty || "Medium",
      mood: recent.mood || "Great"
    };
  } catch (err) {
    console.error("Error generating workout post data", err);
    return null;
  }
};

/**
 * Fetches the user's most recent meal log and formats it into a shareable card payload.
 */
export const generateMealPostData = async (userId) => {
  if (!userId) return null;

  try {
    const meals = await getFoodLogs(userId);
    if (!meals || meals.length === 0) return null;
    
    // Sort by most recent
    const sorted = meals.sort((a, b) => b.timestamp - a.timestamp);
    const recent = sorted[0];

    return {
      id: recent.id,
      name: recent.foodName || "Healthy Meal",
      calories: recent.calories || 0,
      protein: recent.protein || 0,
      carbs: recent.carbs || 0,
      fat: recent.fat || 0,
      fiber: recent.fiber || 0,
      mealTime: recent.mealType || "Snack",
      healthRating: recent.healthScore || "Good"
    };
  } catch (err) {
    console.error("Error generating meal post data", err);
    return null;
  }
};

/**
 * Queries the Gemini proxy to generate an AI Story caption based on recent milestones.
 */
export const generateAIStoryCaption = async (userId) => {
  // Mock AI generation for the prototype
  // In production, this would send recent metrics to /api/gemini/generate-story
  return new Promise((resolve) => {
    setTimeout(() => {
      const stories = [
        "Crushed 5 workouts this week! Feeling unstoppable. 🔥",
        "Reached a 14-day protein streak. Consistency is key! 🥩",
        "Health Score increased by 8 points this month. The grind is paying off! 📈",
        "Completed the Hydration Challenge. Water is life! 💧"
      ];
      resolve(stories[Math.floor(Math.random() * stories.length)]);
    }, 1000);
  });
};

/**
 * Queries the Gemini proxy to enhance/rewrite a user's caption.
 */
export const enhanceCaptionWithAI = async (caption, contextData = null) => {
  // Mock AI enhancement
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`✨ ${caption} Feeling stronger every day! #FitnessJourney #CalyxoHealth 💪`);
    }, 1000);
  });
};
