import { NextResponse } from 'next/server';

const MOCK_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req) {
  try {
    const body = await req.json();
    const { media = [], intent = 'caption', style = 'casual', context = {}, customText = '' } = body;
    
    // Parse media into Gemini-compatible inlineData
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
      return {
        inlineData: { mimeType, data }
      };
    });

    if (!MOCK_API_KEY) {
      return NextResponse.json({
        text: `[Mock AI Magic] Applied style: ${style}. Intent: ${intent}. This is a generated placeholder since no API key is provided.`,
        isMeal: intent === 'meal_analysis',
        isWorkout: intent === 'workout_analysis',
        isProgress: intent === 'progress_analysis',
        suggestedActions: intent === 'meal_analysis' ? ['Log Meal'] : intent === 'workout_analysis' ? ['Save Workout'] : []
      });
    }

    // Construct the prompt based on intent
    let systemPrompt = `You are a context-aware AI assistant for a health & fitness platform called Calyxo. 
The user wants you to: ${intent}. 
Their requested writing style is: ${style}. 
Context: ${JSON.stringify(context)}.
Custom instructions: ${customText}.
If media is provided, analyze ALL images together and base your response heavily on them (e.g., detecting food, workout gear, progress photos).

You MUST output pure JSON matching this exact schema:
{
  "text": "The generated caption, story, or analysis formatted with markdown if necessary.",
  "isMeal": boolean (true if the media/intent is about food),
  "isWorkout": boolean (true if the media/intent is about exercise),
  "isProgress": boolean (true if this is a body transformation/progress pic),
  "suggestedActions": array of strings (e.g. ["Log to Nutrition Tracker", "Save as Today's Workout", "Add to Progress Timeline", "Create Workout Carousel"] - suggest only relevant ones based on the detected content)
}`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: systemPrompt },
            ...imageParts
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${MOCK_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Gemini request failed.");
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

    return NextResponse.json(extractJSON(textResponse));
  } catch (err) {
    console.error("AI Magic error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate AI content." }, { status: 500 });
  }
}
