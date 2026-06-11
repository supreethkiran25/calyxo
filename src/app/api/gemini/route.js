import { NextResponse } from 'next/server';

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
    const { query, context, trainingLogs } = await req.json();
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

    // Compile system prompt from user context details
    let systemPrompt = `You are Calyxo, a smart, encouraging, and highly knowledgeable AI fitness & nutrition coach.
You speak in a modern, encouraging, and direct tone (frequently utilizing clean formatting, markdown headings, bullet points, and highlighting key terms).
Here is the user's current physical biometrics and daily activity context:
- Biometrics: ${context.biometrics}
- Calculated BMI: ${context.bmi}
- Daily Targets: ${context.targets}
- Today's Consumed Nutrition: ${context.consumed}
- Today's Water Intake: ${context.water}
- Today's Logged Foods:
${context.foodListStr || 'No foods logged yet today.'}
- Today's Logged Workouts:
${context.workoutListStr || 'No workouts logged yet today.'}

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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
