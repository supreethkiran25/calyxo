import { NextResponse } from 'next/server';
import exercisesData from '../../../lib/exercises.json';

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

  // Sort by score descending and filter out zeros
  const sorted = scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  // Return top 3 logs
  return sorted.slice(0, 3).map(item => item.log);
}

export async function POST(req) {
  try {
    const { query, context, trainingLogs, personality, memory } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback response if API key is not configured on server side
      return NextResponse.json({
        candidates: [{
          content: {
            parts: [{
              text: `### Calyxo Fitness Coach (Server Demo Mode) 🤖
Backend API route is running, but no server-side **GEMINI_API_KEY** was detected in the environment variables.

* **Biometrics Sync Details:** 
  - Goal: ${context.goal || 'lose'}
  - Current Calorie intake: ${context.consumedCalories || 0} / ${context.targetCalories || 2000} kcal
  - Water intake: ${context.water || 0} ml
  - Workouts logged today: ${context.workoutCount || 0} exercises

Configure the API key in \`.env.local\` to activate live Gemini coaching.`
            }]
          }
        }]
      });
    }

    // Dynamic RAG matched logs extraction
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
      memoryPrompt = `\n- User Historical Memory logs:
  * Login Streak: ${memory.loginStreak || 1} days
  * Active Workout Streak: ${memory.workoutStreak || 0} days
  * Nutrition Tracking Streak: ${memory.nutritionStreak || 0} days
  * Water Compliance Streak: ${memory.waterStreak || 0} days`;
    }

    // RAG: Query matching exercises from the library
    const relevantExercises = searchLibraryExercises(query);
    let exercisesPrompt = "";
    if (relevantExercises.length > 0) {
      exercisesPrompt = `\n\n### Relevant Exercises from Calyxo Library:
You have access to the following matching exercises from the user's exercise database. When recommending or detailing exercises, you MUST recommend these exact ones by name:
${relevantExercises.map(ex => `- **${ex.name}**: Target: ${ex.target}, Body Part: ${ex.body_part}, Equipment: ${ex.equipment}, Difficulty: ${ex.difficulty}, Calories Burned: ~${ex.caloriesEstimate} kcal/min.
  Instructions: ${ex.instructions}`).join('\n')}`;
    }

    // Compile system prompt from user context details
    let systemPrompt = `You are Calyxo, a smart, encouraging, and highly knowledgeable AI fitness & nutrition coach.
${personalityPrompt}
Here is the user's current physical biometrics and daily activity context:
- Biometrics: ${context.biometrics}
- Calculated BMI: ${context.bmi}
- Daily Targets: ${context.targets}
- Today's Consumed Nutrition: ${context.consumed}
- Today's Water Intake: ${context.water}${memoryPrompt}
- Today's Logged Foods:
${context.foodListStr || 'No foods logged yet today.'}
- Today's Logged Workouts:
${context.workoutListStr || 'No workouts logged yet today.'}${exercisesPrompt}

When answering questions:
1. Address the user's specific query.
2. Directly reference their current daily aggregates (e.g. remaining calories, logged workouts, or weight logs) when helpful to give tailored advice.
3. Keep answers structured (use Markdown headings, bold text, lists). Avoid very long dumps of text. Keep it concise.
4. Recommend concrete, practical fitness or nutrition steps. Do not mention API keys or system logs.`;

    if (matchedExamples.length > 0) {
      systemPrompt += `\n\n### Few-Shot Training Examples (Highly-Rated Past Interactions):
Here are some examples of past queries from this user and how they were answered, which were rated highly by the user. Use these as guidelines for your style, content, and formatting:
${matchedExamples.map((ex, idx) => `
Example ${idx + 1}:
User Query: "${ex.user_query}"
Calyxo Response:
"${ex.bot_response}"
`).join('\n')}`;
    }

    // Print final injected prompt to verification terminal
    console.log("=== INJECTED GEMINI SYSTEM PROMPT ===");
    console.log(systemPrompt);
    console.log("=====================================");

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: query }]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        }
      })
    });

    if (!response.ok) {
      const errJson = await response.json();
      return NextResponse.json({ error: errJson.error?.message || "Gemini API error." }, { status: response.status });
    }

    const resData = await response.json();
    return NextResponse.json(resData);

  } catch (err) {
    console.error("Gemini API proxy error", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
