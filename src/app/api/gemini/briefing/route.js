import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { briefingType, userProfile, foodLogs, workoutLogs, weightLogs, waterIntake, healthLogs } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // Helper: calculate calorie summary
    const totalCal = foodLogs?.reduce((s, x) => s + x.calories, 0) || 0;
    const totalProt = foodLogs?.reduce((s, x) => s + (x.protein || 0), 0) || 0;
    const totalWorkouts = workoutLogs?.length || 0;
    const currentWeight = weightLogs?.[weightLogs.length - 1]?.weight || userProfile?.weight || 70;
    const sleepHours = healthLogs?.sleep || 7.5;
    const water = waterIntake || 0;

    if (!apiKey) {
      // Return a simulated high-quality proactive briefing if API key is not configured
      return NextResponse.json({
        report: `### Proactive ${briefingType.replace('_', ' ').toUpperCase()} (Demo Mode) 🤖

Here is a personalized analysis based on your recent activity logs:

* **Nutritional Alignment:** You have consumed **${totalCal} kcal** out of your daily target of **${userProfile?.dailyCalories || 2000} kcal**. Protein is currently at **${Math.round(totalProt)}g** (Target: ${userProfile?.proteinTarget || 120}g).
* **Training & Output:** You have logged **${totalWorkouts}** workout session(s) today.
* **Recovery Status:** Sleep was logged at **${sleepHours} hours**. To improve recovery, aim to hit at least 8 hours tonight.
* **Hydration Checklist:** Current water intake is **${water}ml** / ${userProfile?.waterTarget || 2500}ml.
* **Actionable Recommendation:** Drink another 500ml of water right now and schedule a 20-minute stretching session to relieve muscle tension.`
      });
    }

    let dynamicContext = `
- User Profile: ${JSON.stringify(userProfile)}
- Today's Calorie Intake: ${totalCal} kcal (Target: ${userProfile?.dailyCalories || 2000} kcal)
- Today's Protein: ${totalProt}g (Target: ${userProfile?.proteinTarget || 120}g)
- Today's Workouts: ${totalWorkouts} logged
- Today's Water: ${water} ml (Target: ${userProfile?.waterTarget || 2500} ml)
- Current Weight: ${currentWeight} kg
- Latest Sleep Logged: ${sleepHours} hours
    `;

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

    const systemPrompt = `You are Calyxo, a smart, encouraging, and highly knowledgeable AI fitness & nutrition coach.
Here is the user's current health biometrics and activity context:
${dynamicContext}

Your Task:
${instruction}

Formatting Rules:
1. Use markdown formatting with clear headings (###), bold text (**), and lists (-).
2. Avoid generic intros or outtros. Start directly with the briefing content.
3. Reference their actual metrics (e.g. remaining calories, water intake, sleep) in the text to make it extremely personalized.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: systemPrompt }]
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Gemini Briefing failed.");
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Briefing unavailable. Try again.";
    
    return NextResponse.json({ report: textResponse });

  } catch (err) {
    console.error("Gemini Briefing Proxy error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate briefing." }, { status: 500 });
  }
}
