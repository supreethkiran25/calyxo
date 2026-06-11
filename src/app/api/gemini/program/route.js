import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { goal, userProfile } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Mock plan fallback
      return NextResponse.json({
        goal: goal,
        waterTarget: 3200,
        recoveryTarget: "8-9 hours sleep. Post-workout foam rolling on quads and shoulders.",
        mealPlan: [
          {
            dayName: "Monday",
            meals: [
              { category: "Breakfast", name: "High-Protein Berry Oatmeal", calories: 380, protein: 32, carbs: 48, fat: 6 },
              { category: "Lunch", name: "Spiced Tandoori Chicken & Brown Rice", calories: 510, protein: 44, carbs: 52, fat: 10 },
              { category: "Dinner", name: "Pan-Seared Tofu & Broccoli Bowls", calories: 420, protein: 26, carbs: 40, fat: 12 }
            ]
          }
        ],
        workoutPlan: [
          {
            dayName: "Monday",
            workout: {
              type: "Upper Body Strength Push",
              desc: "Compound lifts focusing on chest and shoulders.",
              exercises: [
                { name: "Incline Bench Press", details: "4 sets x 8 reps" },
                { name: "Overhead Shoulder Press", details: "3 sets x 10 reps" }
              ]
            }
          }
        ]
      });
    }

    const systemPrompt = `Generate a customized 1-week fitness and diet plan. The user goal is "${goal}". 
User profile: ${JSON.stringify(userProfile)}.
Return a JSON object conforming strictly to this format:
{
  "goal": "string",
  "waterTarget": number,
  "recoveryTarget": "string",
  "mealPlan": [
    {
      "dayName": "Monday",
      "meals": [
        { "category": "Breakfast|Lunch|Dinner|Snacks", "name": "string", "calories": number, "protein": number, "carbs": number, "fat": number }
      ]
    }
  ],
  "workoutPlan": [
    {
      "dayName": "Monday",
      "workout": {
        "type": "string",
        "desc": "string",
        "exercises": [
          { "name": "string", "details": "string" }
        ]
      }
    }
  ]
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
      throw new Error(err.error?.message || "Gemini Program request failed.");
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleanJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    
    return NextResponse.json(parsed);

  } catch (err) {
    console.error("Gemini Program proxy error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate plan." }, { status: 500 });
  }
}
