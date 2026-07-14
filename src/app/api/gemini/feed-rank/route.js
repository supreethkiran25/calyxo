import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { userProfile, feedItems } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Mock fallback: Return original order, maybe shuffling slightly
      return NextResponse.json({ rankedIds: feedItems.map(item => item.id) });
    }

    // Keep it fast, we just need to rank IDs
    const systemPrompt = `You are the Calyxo AI Feed Ranker.
Your task is to rank a list of social feed items for a user to maximize relevance and motivation.
User Profile: Goal=${userProfile?.goal}, Interests=${(userProfile?.healthInterests || []).join(',')}.

Feed Items:
${feedItems.map(item => `ID: ${item.id}, Type: ${item.type}, Content: ${item.content}, Author: ${item.username}`).join('\n')}

Rank the items from most relevant (1) to least relevant. Prioritize items that align with the user's goal and interests, or represent major achievements.
Return ONLY a JSON array of the IDs in ranked order, like: ["id2", "id5", "id1"]. Do not return markdown wraps.`;

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
      throw new Error(err.error?.message || "Gemini feed rank request failed.");
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    const extractJSON = (text) => {
      try { return JSON.parse(text); } catch (e) {
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');
        if (start !== -1 && end !== -1 && end > start) {
          return JSON.parse(text.substring(start, end + 1));
        }
        throw e;
      }
    };

    const rankedIds = extractJSON(textResponse);
    return NextResponse.json({ rankedIds });

  } catch (err) {
    console.error("Gemini feed rank proxy error:", err);
    return NextResponse.json({ error: err.message || "Failed to rank feed." }, { status: 500 });
  }
}
