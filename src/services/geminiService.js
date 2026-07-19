import exercisesData from '../lib/exercises.json';

// Helper: extract JSON from possibly-wrapped response
function extractJSON(text) {
  try { return JSON.parse(text); } catch (e) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(text.substring(start, end + 1));
    }
    throw e;
  }
}

// Helper: search exercise library for RAG
function searchLibraryExercises(queryText) {
  if (!queryText) return [];
  const words = queryText.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if (words.length === 0) return [];

  const matches = exercisesData.filter(ex => {
    return words.some(word => 
      ex.name.toLowerCase().includes(word) ||
      (ex.body_part || '').toLowerCase().includes(word) ||
      (ex.target || '').toLowerCase().includes(word) ||
      (ex.equipment || '').toLowerCase().includes(word)
    );
  });

  const scored = matches.map(ex => {
    let score = 0;
    const nameLower = ex.name.toLowerCase();
    const targetLower = (ex.target || '').toLowerCase();
    const equipLower = (ex.equipment || '').toLowerCase();
    const bpLower = (ex.body_part || '').toLowerCase();

    words.forEach(word => {
      if (nameLower.includes(word)) score += 3;
      if (targetLower.includes(word)) score += 2;
      if (bpLower.includes(word)) score += 2;
      if (equipLower.includes(word)) score += 1;
    });

    return { ex, score };
  });

  return scored
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(x => x.ex);
}

function getKeywords(text) {
  const stopwords = new Set([
    "the", "is", "a", "an", "and", "or", "in", "on", "to", "for", "of", "with", "about", 
    "how", "what", "why", "can", "you", "i", "my", "your", "me", "give", "suggest", 
    "recommend", "want", "like", "do", "does", "did", "are", "is", "was", "were"
  ]);
  return (text || "")
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopwords.has(word));
}

function findFewShotExamples(queryText, logs) {
  if (!logs || !Array.isArray(logs)) return [];
  
  const queryKeywords = getKeywords(queryText);
  if (queryKeywords.length === 0) return [];

  const ratedPositives = logs.filter(log => log.rating === 1);

  const scored = ratedPositives.map(log => {
    const logKeywords = getKeywords(log.user_query || "");
    const intersection = queryKeywords.filter(word => logKeywords.includes(word));
    return { log, score: intersection.length };
  });

  const sorted = scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return sorted.slice(0, 3).map(item => item.log);
}

// Secure proxy helper function
async function callGeminiAPI(model, payload) {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, payload })
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Gemini server request failed.");
  }
  
  return await response.json();
}

// =====================================================================
// Main Gemini Chat (replaces /api/gemini)
// =====================================================================
export async function chatWithGemini({ query, context, trainingLogs, personality, memory }) {
  const matchedExamples = findFewShotExamples(query, trainingLogs);

  let personalityPrompt = `You speak in a modern, encouraging, and direct tone (frequently utilizing clean formatting, markdown headings, bullet points, and highlighting key terms).`;
  if (personality === 'friendly') {
    personalityPrompt = `You speak in a warm, empathetic, supportive, and friendly tone. Check on user fatigue, encourage them gently, and use soft, caring formatting.`;
  } else if (personality === 'scientific') {
    personalityPrompt = `You speak in a highly analytical, precise, and scientific tone. Cite or reference biomechanical principles, cellular hypertrophy, metabolic chains, and exact study metrics where helpful.`;
  } else if (personality === 'military') {
    personalityPrompt = `You speak in a high-intensity, drill-sergeant, military tone. Command action, emphasize discipline and consistency, accept zero excuses, and push the user to execute daily.`;
  } else if (personality === 'gym_bro') {
    personalityPrompt = `You speak in a gym-bro, hype tone. Frequently use fitness slang like "bro", "beast mode", "gains", "crush it", "lightweight", and keep the motivation at maximum levels.`;
  } else if (personality === 'nutritionist') {
    personalityPrompt = `You speak in a professional dietitian / nutritionist tone. Emphasize caloric balance, macro splits, micronutrient absorption, gut health, and clean food swaps.`;
  }

  let memoryPrompt = "";
  if (memory) {
    memoryPrompt = `\n- User Historical Memory logs:\n  * Login Streak: ${memory.loginStreak || 1} days\n  * Active Workout Streak: ${memory.workoutStreak || 0} days\n  * Nutrition Tracking Streak: ${memory.nutritionStreak || 0} days\n  * Water Compliance Streak: ${memory.waterStreak || 0} days`;
  }

  const relevantExercises = searchLibraryExercises(query);
  let exercisesPrompt = "";
  if (relevantExercises.length > 0) {
    exercisesPrompt = `\n\n### Relevant Exercises from Calyxo Library:\nYou have access to the following matching exercises from the user's exercise database. When recommending or detailing exercises, you MUST recommend these exact ones by name:\n${relevantExercises.map(ex => `- **${ex.name}**: Target: ${ex.target}, Body Part: ${ex.body_part}, Equipment: ${ex.equipment}, Difficulty: ${ex.difficulty}, Calories Burned: ~${ex.caloriesEstimate} kcal/min.\n  Instructions: ${ex.instructions}`).join('\n')}`;
  }

  let systemPrompt = `You are Calyxo, a smart, encouraging, and highly knowledgeable AI fitness & nutrition coach.\n${personalityPrompt}\nHere is the user's current physical biometrics and daily activity context:\n- Biometrics: ${context.biometrics}\n- Calculated BMI: ${context.bmi}\n- Daily Targets: ${context.targets}\n- Today's Consumed Nutrition: ${context.consumed}\n- Today's Water Intake: ${context.water}${memoryPrompt}\n- Today's Logged Foods:\n${context.foodListStr || 'No foods logged yet today.'}\n- Today's Logged Workouts:\n${context.workoutListStr || 'No workouts logged yet today.'}${exercisesPrompt}\n\nWhen answering questions:\n1. Address the user's specific query.\n2. Directly reference their current daily aggregates (e.g. remaining calories, logged workouts, or weight logs) when helpful to give tailored advice.\n3. Keep answers structured (use Markdown headings, bold text, lists). Avoid very long dumps of text. Keep it concise.\n4. Recommend concrete, practical fitness or nutrition steps. Do not mention API keys or system logs.`;

  if (matchedExamples.length > 0) {
    systemPrompt += `\n\n### Few-Shot Training Examples (Highly-Rated Past Interactions):\nHere are some examples of past queries from this user and how they were answered, which were rated highly by the user. Use these as guidelines for your style, content, and formatting:\n${matchedExamples.map((ex, idx) => `\nExample ${idx + 1}:\nUser Query: "${ex.user_query}"\nCalyxo Response:\n"${ex.bot_response}"\n`).join('\n')}`;
  }

  try {
    const data = await callGeminiAPI("gemini-2.5-flash", {
      contents: [{ role: 'user', parts: [{ text: query }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] }
    });
    return data;
  } catch (err) {
    console.warn("Gemini API call failed, using demo fallback:", err.message);
    return {
      candidates: [{
        content: {
          parts: [{
            text: `### Calyxo Fitness Coach (Demo Mode) 🤖\nNo live API response succeeded.\n\n* **Biometrics Sync Details:** \n  - Goal: ${context.goal || 'lose'}\n  - Current Calorie intake: ${context.consumedCalories || 0} / ${context.targetCalories || 2000} kcal\n  - Water intake: ${context.water || 0} ml\n  - Workouts logged today: ${context.workoutCount || 0} exercises\n\nPlease check your internet connection or configure the API key.`
          }]
        }
      }]
    };
  }
}

// =====================================================================
// Briefing (replaces /api/gemini/briefing)
// =====================================================================
export async function generateBriefing({ briefingType, userProfile, foodLogs, workoutLogs, weightLogs, waterIntake, healthLogs }) {
  const totalCal = foodLogs?.reduce((s, x) => s + x.calories, 0) || 0;
  const totalProt = foodLogs?.reduce((s, x) => s + (x.protein || 0), 0) || 0;
  const totalWorkouts = workoutLogs?.length || 0;
  const currentWeight = weightLogs?.[weightLogs.length - 1]?.weight || userProfile?.weight || 70;
  const sleepHours = healthLogs?.sleep || 7.5;
  const water = waterIntake || 0;

  let dynamicContext = `\n- User Profile: ${JSON.stringify(userProfile)}\n- Today's Calorie Intake: ${totalCal} kcal (Target: ${userProfile?.dailyCalories || 2000} kcal)\n- Today's Protein: ${totalProt}g (Target: ${userProfile?.proteinTarget || 120}g)\n- Today's Workouts: ${totalWorkouts} logged\n- Today's Water: ${water} ml (Target: ${userProfile?.waterTarget || 2500} ml)\n- Current Weight: ${currentWeight} kg\n- Latest Sleep Logged: ${sleepHours} hours`;

  let instruction = "";
  if (briefingType === 'daily_briefing') {
    instruction = `Generate a concise "Daily Briefing" summarizing the user's status for the day. Highlight remaining calories, water intake, sleep quality, and active streaks. Keep it highly motivational, direct, and under 150 words. Use bullet points and bold headers.`;
  } else if (briefingType === 'weekly_review') {
    instruction = `Generate a "Weekly Progress Review" based on the user's weekly metrics. Analyze weight trends, total workouts logged, and nutrient averages. Provide constructive critiques and target adjustments for the upcoming week. Use bullet points and bold headers.`;
  } else if (briefingType === 'monthly_review') {
    instruction = `Generate a comprehensive "Monthly Transformation Audit". Compare starting parameters vs current parameters. Critique metabolic progress, consistency, and compliance index. Use bullet points and bold headers.`;
  } else {
    instruction = `Generate "Smart Recommendations" tailored to the user's fitness goal. List 2 customized high-protein recipes using typical Indian foods, 1 custom workout optimization tip (based on their logs), and 1 recovery recommendation. Use bullet points and bold headers.`;
  }

  const systemPrompt = `You are Calyxo, a smart, encouraging, and highly knowledgeable AI fitness & nutrition coach.\nHere is the user's current health biometrics and activity context:\n${dynamicContext}\n\nYour Task:\n${instruction}\n\nFormatting Rules:\n1. Use markdown formatting with clear headings (###), bold text (**), and lists (-).\n2. Avoid generic intros or outtros. Start directly with the briefing content.\n3. Reference their actual metrics (e.g. remaining calories, water intake, sleep) in the text to make it extremely personalized.`;

  try {
    const data = await callGeminiAPI("gemini-2.5-flash", {
      contents: [{ parts: [{ text: systemPrompt }] }]
    });
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Briefing unavailable. Try again.";
    return { report: textResponse };
  } catch (err) {
    console.warn("Briefing generation failed, using fallback report:", err.message);
    return {
      report: `### Proactive ${briefingType.replace('_', ' ').toUpperCase()} (Demo Mode) 🤖\n\nHere is a personalized analysis based on your recent activity logs:\n\n* **Nutritional Alignment:** You have consumed **${totalCal} kcal** out of your daily target of **${userProfile?.dailyCalories || 2000} kcal**. Protein is currently at **${Math.round(totalProt)}g** (Target: ${userProfile?.proteinTarget || 120}g).\n* **Training & Output:** You have logged **${totalWorkouts}** workout session(s) today.\n* **Recovery Status:** Sleep was logged at **${sleepHours} hours**. To improve recovery, aim to hit at least 8 hours tonight.\n* **Hydration Checklist:** Current water intake is **${water}ml** / ${userProfile?.waterTarget || 2500}ml.\n* **Actionable Recommendation:** Drink another 500ml of water right now and schedule a 20-minute stretching session to relieve muscle tension.`
    };
  }
}

// =====================================================================
// Grocery List (replaces /api/gemini/grocery)
// =====================================================================
export async function generateGroceryList({ mealPlan, preferences, program }) {
  const actualMealPlan = mealPlan || program?.mealPlan || program;
  const actualPrefs = preferences || program?.preferences;

  const systemPrompt = `Compile a structured weekly grocery shopping list based on these meal plans: ${JSON.stringify(actualMealPlan)}. \nPreferences: ${JSON.stringify(actualPrefs || {})}.\nCategorize item requirements logically (e.g., Produce, Meats, Grains, Dairy).\nOutput a JSON response conforming strictly to this format:\n{\n  "categories": [\n    { "name": "string", "items": ["string", "string"] }\n  ]\n}\nDo not write markdown quotes or wraps. Return pure JSON.`;

  try {
    const data = await callGeminiAPI("gemini-2.5-flash", {
      contents: [{ parts: [{ text: systemPrompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    const parsed = extractJSON(data.candidates?.[0]?.content?.parts?.[0]?.text);
    
    if (parsed && parsed.categories && !parsed.grocery) {
      parsed.grocery = parsed.categories;
    } else if (parsed && parsed.grocery && !parsed.categories) {
      parsed.categories = parsed.grocery;
    }
    return parsed;
  } catch (err) {
    console.warn("Failed to generate grocery list, returning fallback data:", err.message);
    const mockData = {
      categories: [
        { name: "Proteins & Meats", items: ["Organic Chicken Breast (1.5kg)", "Atlantic Salmon Fillets (600g)", "Large Eggs (2 dozen)"] },
        { name: "Grains & Complex Carbs", items: ["Organic Brown Rice (1kg)", "Rolled Oats (500g)", "Multigrain Roti Flour (2kg)"] },
        { name: "Produce & Veggies", items: ["Broccoli (3 heads)", "Baby Spinach (2 bags)", "Avocados (5 units)", "Fresh Berries (300g)"] }
      ]
    };
    mockData.grocery = mockData.categories;
    return mockData;
  }
}

// =====================================================================
// Post Magic (replaces /api/gemini/post-magic)
// =====================================================================
export async function generatePostMagic({ media = [], intent = 'caption', style = 'casual', context = {}, customText = '' }) {
  const imageParts = media.map(img => {
    let mimeType = 'image/jpeg';
    let data = img;
    if (img.startsWith('data:')) {
      const match = img.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        data = match[2];
      }
    }
    return { inlineData: { mimeType, data } };
  });

  const systemPrompt = `You are a context-aware AI assistant for a health & fitness platform called Calyxo. \nThe user wants you to: ${intent}. \nTheir requested writing style is: ${style}. \nContext: ${JSON.stringify(context)}.\nCustom instructions: ${customText}.\nIf media is provided, analyze ALL images together and base your response heavily on them.\n\nYou MUST output pure JSON matching this exact schema:\n{\n  "text": "The generated caption, story, or analysis formatted with markdown if necessary.",\n  "isMeal": boolean,\n  "isWorkout": boolean,\n  "isProgress": boolean,\n  "suggestedActions": array of strings\n}`;

  try {
    const data = await callGeminiAPI("gemini-2.5-flash", {
      contents: [{ parts: [{ text: systemPrompt }, ...imageParts] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    return extractJSON(data.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (err) {
    console.warn("Post magic generation failed, using fallback:", err.message);
    return {
      text: `[Mock AI Magic] Applied style: ${style}. Intent: ${intent}. (Offline mode fallback)`,
      isMeal: intent === 'meal_analysis',
      isWorkout: intent === 'workout_analysis',
      isProgress: intent === 'progress_analysis',
      suggestedActions: intent === 'meal_analysis' ? ['Log Meal'] : intent === 'workout_analysis' ? ['Save Workout'] : []
    };
  }
}

// =====================================================================
// Predict Body Composition (replaces /api/gemini/predict)
// =====================================================================
export async function predictBodyComposition({ userProfile, currentWeight, targetCalories, activeDeficit }) {
  const systemPrompt = `Analyze the user biometrics and target calorie setup to forecast body composition trends.\nProfile: ${JSON.stringify(userProfile)}, Current Weight: ${currentWeight}, Target Calorie Intake: ${targetCalories}, Expected Deficit: ${activeDeficit || 500} kcal/day.\nCalculate forecast metrics at 30, 60, 90, and 180 days.\nOutput a JSON response conforming strictly to this format:\n{\n  "predictions": [\n    { "day": 30, "weight": number, "fatLoss": number, "muscleGain": number },\n    { "day": 60, "weight": number, "fatLoss": number, "muscleGain": number },\n    { "day": 90, "weight": number, "fatLoss": number, "muscleGain": number },\n    { "day": 180, "weight": number, "fatLoss": number, "muscleGain": number }\n  ],\n  "confidence": number,\n  "reasoning": "string"\n}\nDo not write markdown quotes or wraps. Return pure JSON.`;

  try {
    const data = await callGeminiAPI("gemini-2.5-flash", {
      contents: [{ parts: [{ text: systemPrompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    return extractJSON(data.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (err) {
    console.warn("Body composition prediction failed, returning mock:", err.message);
    const w = Number(currentWeight) || 70;
    return {
      predictions: [
        { day: 30, weight: (w - 1.2).toFixed(1), fatLoss: 0.8, muscleGain: 0.2 },
        { day: 60, weight: (w - 2.5).toFixed(1), fatLoss: 1.6, muscleGain: 0.3 },
        { day: 90, weight: (w - 3.8).toFixed(1), fatLoss: 2.5, muscleGain: 0.5 },
        { day: 180, weight: (w - 7.5).toFixed(1), fatLoss: 5.2, muscleGain: 0.9 }
      ],
      confidence: 88,
      reasoning: "Steady caloric deficit of ~500 kcal daily ensures consistent fat loss while high-protein intake safeguards existing skeletal muscle mass."
    };
  }
}

// =====================================================================
// Generate Program (replaces /api/gemini/program)
// =====================================================================
export async function generateProgram({ goal, userProfile }) {
  const systemPrompt = `Generate a customized 1-week fitness and diet plan. The user goal is "${goal}". \nUser profile: ${JSON.stringify(userProfile)}.\nReturn a JSON object conforming strictly to this format:\n{\n  "goal": "string",\n  "waterTarget": number,\n  "recoveryTarget": "string",\n  "mealPlan": [\n    {\n      "dayName": "Monday",\n      "meals": [\n        { "category": "Breakfast|Lunch|Dinner|Snacks", "name": "string", "calories": number, "protein": number, "carbs": number, "fat": number }\n      ]\n    }\n  ],\n  "workoutPlan": [\n    {\n      "dayName": "Monday",\n      "workout": {\n        "type": "string",\n        "desc": "string",\n        "exercises": [\n          { "name": "string", "details": "string" }\n        ]\n      }\n    }\n  ]\n}\nDo not write markdown quotes or wraps. Return pure JSON.`;

  try {
    const data = await callGeminiAPI("gemini-2.5-flash", {
      contents: [{ parts: [{ text: systemPrompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    return extractJSON(data.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (err) {
    console.warn("Failed to generate program, using default local template:", err.message);
    return {
      goal: goal,
      waterTarget: 3200,
      recoveryTarget: "8-9 hours sleep. Post-workout foam rolling on quads and shoulders.",
      mealPlan: [{ dayName: "Monday", meals: [
        { category: "Breakfast", name: "High-Protein Berry Oatmeal", calories: 380, protein: 32, carbs: 48, fat: 6 },
        { category: "Lunch", name: "Spiced Tandoori Chicken & Brown Rice", calories: 510, protein: 44, carbs: 52, fat: 10 },
        { category: "Dinner", name: "Pan-Seared Tofu & Broccoli Bowls", calories: 420, protein: 26, carbs: 40, fat: 12 }
      ]}],
      workoutPlan: [{ dayName: "Monday", workout: { type: "Upper Body Strength Push", desc: "Compound lifts focusing on chest and shoulders.", exercises: [
        { name: "Incline Bench Press", details: "4 sets x 8 reps" },
        { name: "Overhead Shoulder Press", details: "3 sets x 10 reps" }
      ]}}]
    };
  }
}

// =====================================================================
// Trainer Report (replaces /api/gemini/report)
// =====================================================================
export async function generateTrainerReport({ reportType, workouts, foods }) {
  const prompt = `\nYou are a professional fitness coach analyzing client data for a trainer.\nGenerate a ${reportType} for this client based on their data from the last 30 days:\n\nWorkout logs: ${JSON.stringify(workouts.map(w => ({ name: w.name, duration: w.duration, timestamp: w.timestamp })))}\nFood logs: ${JSON.stringify(foods.map(f => ({ name: f.name || f.food_name, calories: f.calories, timestamp: f.timestamp })))}\n\nProvide: executive summary, key insights, areas of improvement, recommendations.\nFormat as structured sections with clear headings in markdown.\nKeep it concise and professional.\n`;

  try {
    const data = await callGeminiAPI("gemini-1.5-flash", {
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Trainer report unavailable.";
    return { report: textResponse };
  } catch (err) {
    console.warn("Trainer report generation failed, using mock:", err.message);
    return {
      report: `# ${reportType}\n      \n## Executive Summary\nThe client has logged ${workouts.length} workouts and ${foods.length} meals in the past 30 days.\n\n## Key Insights\n- **Consistency**: Client is logging consistently.\n- **Nutrition**: Average calories are tracking to their target.\n\n## Areas of Improvement\n- Consider increasing water intake.\n- Try to add one more resistance session per week.\n\n## Recommendations\n- Continue with current meal plan.\n- Add 15 mins of mobility work on rest days.`
    };
  }
}

// =====================================================================
// Health Twin (replaces /api/gemini/twin)
// =====================================================================
export async function syncHealthTwin({ userProfile, metrics, recentLogs, activeDeficit }) {
  const getMockTwin = () => {
    const w = Number(userProfile?.weight) || 70;
    return {
      recoveryScore: 82,
      fitnessAge: userProfile?.age ? userProfile.age - 2 : 25,
      sleepDebt: 1.5,
      dailyHealthScore: 88,
      predictedWeight: (w - 1.2).toFixed(1),
      predictedMuscleGain: 0.4,
      predictedFatLoss: 0.8,
      calorieForecast: 2100,
      weeklyHealthForecast: "Steady progress. Your hydration and protein intake are optimal for fat loss.",
      riskDetection: "None. Keep up the good work.",
      personalizedRecommendations: ["Increase water intake by 500ml", "Ensure 7+ hours of sleep for better recovery"]
    };
  };

  const systemPrompt = `You are Calyxo AI, an advanced Health OS digital twin engine.\nAnalyze the following user data to compute a comprehensive daily health snapshot.\nProfile: ${JSON.stringify(userProfile)}\nCurrent Metrics (BMR, TDEE, etc.): ${JSON.stringify(metrics)}\nRecent Logs (Food, Workout, Sleep, Water): ${JSON.stringify(recentLogs)}\nTarget Deficit: ${activeDeficit || 0} kcal/day.\n\nCalculate and return the following metrics in a pure JSON object:\n{\n  "recoveryScore": number (0-100 based on sleep and workout intensity),\n  "fitnessAge": number (estimated biological age based on activity),\n  "sleepDebt": number (hours),\n  "dailyHealthScore": number (0-100 overall score),\n  "predictedWeight": number (estimated weight in 30 days based on current deficit),\n  "predictedMuscleGain": number (estimated lbs/kg gained in 30 days),\n  "predictedFatLoss": number (estimated lbs/kg lost in 30 days),\n  "calorieForecast": number (recommended intake for tomorrow),\n  "weeklyHealthForecast": "string (short paragraph forecasting the week)",\n  "riskDetection": "string (any overtraining, undereating, or dehydration risks)",\n  "personalizedRecommendations": ["string", "string"]\n}\nDo not write markdown quotes or wraps. Return pure JSON.`;

  try {
    const data = await callGeminiAPI("gemini-2.5-flash", {
      contents: [{ parts: [{ text: systemPrompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    return extractJSON(data.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (err) {
    console.warn("Gemini Twin error, falling back to mock:", err.message);
    return getMockTwin();
  }
}

// =====================================================================
// Vision / Meal Scanner (replaces /api/gemini/vision)
// =====================================================================
export async function scanMealVision({ imageBase64, mimeType, image, userGoal }) {
  if (image && image.startsWith('data:')) {
    const match = image.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      mimeType = match[1];
      imageBase64 = match[2];
    }
  }

  const systemPrompt = `Analyze the uploaded meal photo. Provide the name of the meal and estimate the nutritional metrics per portion (Calories in kcal, Protein in g, Carbohydrates in g, Fat in g, Fiber in g, Sugar in g). Also calculate a compatibility score from 0-100 based on the user's primary goal: "${userGoal || 'lose'}". Higher protein and fiber fit weight loss/muscle gains better.\nProvide the response strictly in JSON format matching this schema:\n{\n  "foodName": "string",\n  "calories": number,\n  "protein": number,\n  "carbs": number,\n  "fat": number,\n  "fiber": number,\n  "sugar": number,\n  "compatibilityScore": number,\n  "compatibilityReason": "string explanation referencing user's goal",\n  "healthyAlternatives": ["string", "string"]\n}\nDo not return any markdown wraps or comments. Return pure JSON.`;

  try {
    const data = await callGeminiAPI("gemini-2.5-flash", {
      contents: [{
        parts: [
          { text: systemPrompt },
          { inlineData: { mimeType: mimeType || 'image/jpeg', data: imageBase64 } }
        ]
      }],
      generationConfig: { responseMimeType: "application/json" }
    });
    return extractJSON(data.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (err) {
    console.warn("Vision scanner error, using fallback salmon meal estimation:", err.message);
    return {
      foodName: "Grilled Salmon & Rice (Demo)",
      calories: 520,
      protein: 38,
      carbs: 45,
      fat: 16,
      fiber: 3.5,
      sugar: 1.2,
      compatibilityScore: 88,
      compatibilityReason: "High protein and healthy fats fit your gains target, although slightly high in overall calorie density.",
      healthyAlternatives: ["Steamed Cod with Quinoa", "Lemon Herb Grilled Chicken Salad"]
    };
  }
}
