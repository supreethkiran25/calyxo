import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { 
      userProfile, 
      activeMetrics, 
      sleepHistory, 
      stepsHistory, 
      nutritionLogs, 
      workoutLogs,
      isReport,
      reportType
    } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    // Aggregate statistics for fallback & prompt context
    const stepsAvg = stepsHistory?.length > 0
      ? Math.round(stepsHistory.reduce((s, x) => s + x.steps, 0) / stepsHistory.length)
      : 8400;

    const sleepAvg = sleepHistory?.length > 0
      ? Number((sleepHistory.reduce((s, x) => s + x.duration, 0) / sleepHistory.length).toFixed(1))
      : 7.2;

    const restingHR = activeMetrics?.restingHR || 62;
    const recoveryScore = activeMetrics?.recoveryScore || 75;
    const readinessScore = activeMetrics?.readinessScore || 80;

    if (!apiKey) {
      // Mock health insights fallback
      if (isReport) {
        return NextResponse.json({
          insights: `### Calyxo ${reportType === 'weekly' ? 'Weekly' : 'Monthly'} Health Report Summary 📊
Based on your wearable tracking inputs, here is your wellness analysis:

* **Activity & Steps:** You achieved an average of **${stepsAvg.toLocaleString()} steps** daily. This meets approximately **${Math.round((stepsAvg / 10000) * 100)}%** of your target step compliance.
* **Sleep Quality & Rest:** Sleep duration averaged **${sleepAvg} hours** with consistent sleep phase cycles.
* **Heart Rate & Recovery:** Resting Heart Rate is stable at **${restingHR} bpm**, indicating good cardiovascular baseline recovery.
* **Overall Recovery Index:** Your average Recovery Score was **${recoveryScore}/100** (${activeMetrics?.recoveryCategory || 'Good'}).
* **Daily Readiness Trend:** Average readiness index was **${readinessScore}/100**, recommending a **${activeMetrics?.readinessRecommendation || 'Moderate Workout'}** phase.

**AI Recommendation:** Continue targeting protein levels. Try increasing step count by 500 steps/day over the next week to trigger optimal cardiovascular progress.`
        });
      }

      return NextResponse.json({
        insights: `### Daily AI Wellness Analysis 🏥
Here is your personalized wearable analytics overview:

* **Active Steps:** You logged **${(activeMetrics?.steps || 9200).toLocaleString()} steps** today. You are making solid progress towards your daily targets.
* **Sleep Consistency:** You slept **${activeMetrics?.sleepDuration || 7.4} hours** last night. Sleep duration is stable, but sleep quality could be improved by avoiding blue light 1 hour before sleep.
* **Recovery Status:** Recovery indicators score **${recoveryScore}/100** (Resting HR: **${restingHR} bpm**).
* **Readiness Score:** Readiness is at **${readinessScore}/100**. This suggests a **${activeMetrics?.readinessRecommendation || 'Moderate Workout'}** day. Make sure to hydrate with at least **2,500ml** of water today!`
      });
    }

    // Prepare Prompt Context
    const profileStr = `Gender: ${userProfile?.gender || 'male'}, Age: ${userProfile?.age || 25}, Weight: ${userProfile?.weight || 70}kg, Height: ${userProfile?.height || 175}cm, Goal: ${userProfile?.goal || 'lose'}`;
    const recentNutritionStr = nutritionLogs?.length > 0
      ? nutritionLogs.map(l => `- ${l.name}: ${l.calories} kcal (P: ${l.protein}g)`).join('\n')
      : 'None logged';
    const recentWorkoutsStr = workoutLogs?.length > 0
      ? workoutLogs.map(w => `- ${w.name}: ${w.category || 'workout'}`).join('\n')
      : 'None logged';

    let systemPrompt = `You are Calyxo Health Advisor, a highly intelligent clinical fitness and biometric wearable analysis bot.
Analyze the user's biometric stats and generate actionable health recommendations.

User Profile: ${profileStr}
Current Today Metrics:
- Steps: ${activeMetrics?.steps || 0}
- Active Calories Burned: ${activeMetrics?.caloriesBurned || 0} kcal
- Distance: ${activeMetrics?.distance || 0} km
- Sleep Duration: ${activeMetrics?.sleepDuration || 0} hours
- Resting Heart Rate: ${restingHR} bpm
- Recovery Score: ${recoveryScore}/100
- Daily Readiness Score: ${readinessScore}/100
- Hydration Status: ${activeMetrics?.hydrationStatus || 0} ml

Wearable Historical trends:
- Average Steps (last 7 logs): ${stepsAvg} steps
- Average Sleep Duration (last 7 logs): ${sleepAvg} hours
- Recent logged meals:
${recentNutritionStr}
- Recent logged workouts:
${recentWorkoutsStr}
`;

    if (isReport) {
      systemPrompt += `
The user is requesting a formal **${reportType}** health report.
Deliver a professional health report summary. Include:
1. Executive Summary of their activity, sleep, and recovery.
2. Breakdown of step compliance and cardiovascular index (Resting Heart Rate).
3. Nutrition and Hydration compliance suggestions.
4. AI Predictions and target benchmarks for the upcoming week.

Use markdown tables, bold highlights, and clean bullet points. Keep it professional, encouraging, and highly detailed.`;
    } else {
      systemPrompt += `
The user is requesting a **daily personalized wellness insight**.
Provide a quick, punchy, actionable analysis. Keep it under 150 words.
Include:
- One positive achievement from today's stats.
- One warning or recommendation (e.g. sleep hygiene, hydration, resting HR check).
- A readiness guidance recommendation (e.g., "Recovery indicators suggest a light workout tomorrow").

Format with clean markdown bullets. Do not make up facts, refer strictly to the given stats.`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          }
        ]
      })
    });

    if (!response.ok) {
      const errJson = await response.json();
      throw new Error(errJson.error?.message || "Gemini API error.");
    }

    const resData = await response.json();
    const textResponse = resData.candidates?.[0]?.content?.parts?.[0]?.text || "Failed to analyze health metrics.";

    return NextResponse.json({ insights: textResponse });

  } catch (err) {
    console.error("Gemini Health Insights API proxy error", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
