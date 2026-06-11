import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { userProfile, currentWeight, targetCalories, activeDeficit } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Mock prediction fallback
      const w = Number(currentWeight) || 70;
      return NextResponse.json({
        predictions: [
          { day: 30, weight: (w - 1.2).toFixed(1), fatLoss: 0.8, muscleGain: 0.2 },
          { day: 60, weight: (w - 2.5).toFixed(1), fatLoss: 1.6, muscleGain: 0.3 },
          { day: 90, weight: (w - 3.8).toFixed(1), fatLoss: 2.5, muscleGain: 0.5 },
          { day: 180, weight: (w - 7.5).toFixed(1), fatLoss: 5.2, muscleGain: 0.9 }
        ],
        confidence: 88,
        reasoning: "Steady caloric deficit of ~500 kcal daily ensures consistent fat loss while high-protein intake safeguards existing skeletal muscle mass."
      });
    }

    const systemPrompt = `Analyze the user biometrics and target calorie setup to forecast body composition trends.
Profile: ${JSON.stringify(userProfile)}, Current Weight: ${currentWeight}, Target Calorie Intake: ${targetCalories}, Expected Deficit: ${activeDeficit || 500} kcal/day.
Calculate forecast metrics at 30, 60, 90, and 180 days.
Output a JSON response conforming strictly to this format:
{
  "predictions": [
    { "day": 30, "weight": number, "fatLoss": number, "muscleGain": number },
    { "day": 60, "weight": number, "fatLoss": number, "muscleGain": number },
    { "day": 90, "weight": number, "fatLoss": number, "muscleGain": number },
    { "day": 180, "weight": number, "fatLoss": number, "muscleGain": number }
  ],
  "confidence": number,
  "reasoning": "string"
}
Do not write markdown quotes or wraps. Return pure JSON.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: systemPrompt }]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Gemini Predictions request failed.");
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleanJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    
    return NextResponse.json(parsed);

  } catch (err) {
    console.error("Gemini Predictions proxy error:", err);
    return NextResponse.json({ error: err.message || "Failed to calculate predictions." }, { status: 500 });
  }
}
