import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    let imageBase64 = body.imageBase64;
    let mimeType = body.mimeType;
    const userGoal = body.userGoal;

    if (body.image && body.image.startsWith('data:')) {
      const match = body.image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        imageBase64 = match[2];
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return mock scanner data if API key is not configured
      return NextResponse.json({
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
      });
    }

    const systemPrompt = `Analyze the uploaded meal photo. Provide the name of the meal and estimate the nutritional metrics per portion (Calories in kcal, Protein in g, Carbohydrates in g, Fat in g, Fiber in g, Sugar in g). Also calculate a compatibility score from 0-100 based on the user's primary goal: "${userGoal || 'lose'}". Higher protein and fiber fit weight loss/muscle gains better.
Provide the response strictly in JSON format matching this schema:
{
  "foodName": "string",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "sugar": number,
  "compatibilityScore": number,
  "compatibilityReason": "string explanation referencing user's goal",
  "healthyAlternatives": ["string", "string"]
}
Do not return any markdown wraps or comments. Return pure JSON.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt },
              {
                inlineData: {
                  mimeType: mimeType || 'image/jpeg',
                  data: imageBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Gemini Vision request failed.");
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // Parse JSON safely
    const extractJSON = (text) => {
      try {
        return JSON.parse(text);
      } catch (e) {
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
    console.error("Gemini Vision proxy error:", err);
    return NextResponse.json({ error: err.message || "Failed to scan meal photo." }, { status: 500 });
  }
}
