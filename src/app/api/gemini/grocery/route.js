import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { mealPlan, preferences } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Mock grocery fallback
      return NextResponse.json({
        categories: [
          { name: "Proteins & Meats", items: ["Organic Chicken Breast (1.5kg)", "Atlantic Salmon Fillets (600g)", "Large Eggs (2 dozen)"] },
          { name: "Grains & Complex Carbs", items: ["Organic Brown Rice (1kg)", "Rolled Oats (500g)", "Multigrain Roti Flour (2kg)"] },
          { name: "Produce & Veggies", items: ["Broccoli (3 heads)", "Baby Spinach (2 bags)", "Avocados (5 units)", "Fresh Berries (300g)"] }
        ]
      });
    }

    const systemPrompt = `Compile a structured weekly grocery shopping list based on these meal plans: ${JSON.stringify(mealPlan)}. 
Preferences: ${JSON.stringify(preferences || {})}.
Categorize item requirements logically (e.g., Produce, Meats, Grains, Dairy).
Output a JSON response conforming strictly to this format:
{
  "categories": [
    { "name": "string", "items": ["string", "string"] }
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
      throw new Error(err.error?.message || "Gemini Grocery request failed.");
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
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
    console.error("Gemini Grocery proxy error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate grocery list." }, { status: 500 });
  }
}
