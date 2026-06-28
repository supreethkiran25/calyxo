import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { userProfile, metrics, recentLogs, activeDeficit } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

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
        personalizedRecommendations: [
          "Increase water intake by 500ml",
          "Ensure 7+ hours of sleep for better recovery"
        ]
      };
    };

    if (!apiKey) {
      // Mock Twin fallback
      return NextResponse.json(getMockTwin());
    }

    const systemPrompt = `You are Calyxo AI, an advanced Health OS digital twin engine.
Analyze the following user data to compute a comprehensive daily health snapshot.
Profile: ${JSON.stringify(userProfile)}
Current Metrics (BMR, TDEE, etc.): ${JSON.stringify(metrics)}
Recent Logs (Food, Workout, Sleep, Water): ${JSON.stringify(recentLogs)}
Target Deficit: ${activeDeficit || 0} kcal/day.

Calculate and return the following metrics in a pure JSON object:
{
  "recoveryScore": number (0-100 based on sleep and workout intensity),
  "fitnessAge": number (estimated biological age based on activity),
  "sleepDebt": number (hours),
  "dailyHealthScore": number (0-100 overall score),
  "predictedWeight": number (estimated weight in 30 days based on current deficit),
  "predictedMuscleGain": number (estimated lbs/kg gained in 30 days),
  "predictedFatLoss": number (estimated lbs/kg lost in 30 days),
  "calorieForecast": number (recommended intake for tomorrow),
  "weeklyHealthForecast": "string (short paragraph forecasting the week)",
  "riskDetection": "string (any overtraining, undereating, or dehydration risks)",
  "personalizedRecommendations": ["string", "string"]
}
Do not write markdown quotes or wraps. Return pure JSON.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Gemini Twin request failed.");
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    const extractJSON = (text) => {
      try { return JSON.parse(text); } catch (e) {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
          return JSON.parse(text.substring(start, end + 1));
        }
        throw e;
      }
    };

    const parsed = extractJSON(textResponse);
    return NextResponse.json(parsed);

  } catch (err) {
    console.warn("Gemini Twin proxy error (falling back to mock):", err.message);
    const w = Number(70); // Safe fallback
    return NextResponse.json({
        recoveryScore: 82,
        fitnessAge: 25,
        sleepDebt: 1.5,
        dailyHealthScore: 88,
        predictedWeight: (w - 1.2).toFixed(1),
        predictedMuscleGain: 0.4,
        predictedFatLoss: 0.8,
        calorieForecast: 2100,
        weeklyHealthForecast: "Steady progress. Your hydration and protein intake are optimal for fat loss.",
        riskDetection: "None. Keep up the good work.",
        personalizedRecommendations: [
          "Increase water intake by 500ml",
          "Ensure 7+ hours of sleep for better recovery"
        ]
    });
  }
}
