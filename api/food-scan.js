const FOOD_SCAN_PROMPT = `You are a nutrition analysis AI. Analyse this food image.
Return ONLY a valid JSON object — no markdown, no backticks, no explanation.

Required format:
{
  "food_name": "string (specific name, e.g. 'Butter Chicken with Basmati Rice')",
  "estimated_grams": number (realistic portion weight in grams),
  "confidence": "high" | "medium" | "low",
  "calories": number (kcal),
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "fiber_g": number,
  "serving_description": "string (e.g. '1 bowl ~300g' or '2 rotis ~120g')",
  "notes": "string or null (e.g. 'Multiple items detected, showing dominant item' or 'Home-cooked estimate')"
}

Rules:
- If multiple foods are visible, identify the dominant item and note others in 'notes'
- For Indian dishes, use common Indian food names
- 'confidence' is 'high' if the food is clearly visible and identifiable,
  'medium' if partially obscured or ambiguous portion,
  'low' if the image is dark, blurry, or the food is unclear
- If the image contains NO food at all, return exactly: {"error": "not_food"}
- If the image is too dark or blurry to identify: {"error": "unclear_image"}
- All numeric values must be realistic — do not fabricate extreme values`;

function extractJsonFromText(rawText) {
  if (!rawText) return null;
  let clean = rawText.replace(/```json|```/gi, '').trim();

  try {
    return JSON.parse(clean);
  } catch (e) {
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (err) {
        console.warn("[ServerFoodScan] Regex JSON parse error:", err);
      }
    }
  }
  return null;
}

export default async function handler(req, res) {
  // Set CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const { base64Image, requestId } = req.body || {};
  const reqId = requestId || `srv_${Date.now()}`;

  if (!base64Image || typeof base64Image !== 'string' || base64Image.length < 50) {
    return res.status(400).json({ error: { message: 'Invalid or missing base64Image payload.' } });
  }

  const cleanBase64 = base64Image
    .replace(/^data:image\/[a-z]+;base64,/, '')
    .replace(/[\r\n\s]/g, '');

  // Server-side API key retrieval (Completely hidden from browser bundle & network tab)
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error(`[ServerFoodScan:${reqId}] GEMINI_API_KEY environment variable is not configured.`);
    return res.status(500).json({ error: { message: 'Gemini API key is not configured on server.' } });
  }

  const payload = {
    contents: [{
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64
          }
        },
        { text: FOOD_SCAN_PROMPT }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 512
    }
  };

  const primaryModel = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${primaryModel}:generateContent?key=${apiKey}`;

  try {
    console.log(`[ServerFoodScan:${reqId}] Invoking Gemini API model ${primaryModel}...`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.warn(`[ServerFoodScan:${reqId}] Gemini API returned status ${response.status}:`, data);
      
      if (response.status === 429) {
        return res.status(429).json({
          error: {
            code: 429,
            message: "You've reached the Gemini API rate limit. Please wait a minute and try again, or upgrade your API quota."
          }
        });
      }

      return res.status(response.status).json(data);
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return res.status(500).json({ error: { message: 'Gemini returned an empty response. Please retry with a clearer photo.' } });
    }

    const parsed = extractJsonFromText(rawText);
    if (!parsed) {
      return res.status(422).json({ error: { message: 'Failed to parse structured nutrition JSON from Gemini response.' } });
    }

    if (parsed.error === 'not_food') {
      return res.status(400).json({ error: { message: 'No food detected in this image. Try again with a clearer photo of a meal.' } });
    }
    if (parsed.error === 'unclear_image') {
      return res.status(400).json({ error: { message: 'Image too dark or blurry. Move to better lighting and try again.' } });
    }

    const foodName = parsed.food_name || parsed.foodName || parsed.name || parsed.item || "Scanned Meal";
    const calories = Number(parsed.calories ?? parsed.energy ?? parsed.kcal) || 200;
    const protein = Number(parsed.protein_g ?? parsed.protein ?? parsed.proteinGrams) || 0;
    const carbs = Number(parsed.carbs_g ?? parsed.carbs ?? parsed.carbohydrates) || 0;
    const fat = Number(parsed.fat_g ?? parsed.fat ?? parsed.fats) || 0;
    const fiber = Number(parsed.fiber_g ?? parsed.fiber) || 0;
    const grams = Number(parsed.estimated_grams ?? parsed.grams ?? parsed.weight) || 100;
    const confidence = parsed.confidence || 'medium';
    const serving = parsed.serving_description || parsed.serving || parsed.portion || `~${grams}g`;
    const notes = parsed.notes || null;

    const result = {
      food_name: foodName,
      estimated_grams: grams,
      confidence: confidence,
      calories: Math.round(calories),
      protein_g: parseFloat(protein.toFixed(1)),
      carbs_g: parseFloat(carbs.toFixed(1)),
      fat_g: parseFloat(fat.toFixed(1)),
      fiber_g: parseFloat(fiber.toFixed(1)),
      serving_description: serving,
      notes: notes
    };

    console.log(`[ServerFoodScan:${reqId}] Successfully scanned: ${result.food_name} (${result.calories} kcal)`);
    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error(`[ServerFoodScan:${reqId}] Exception:`, err);
    return res.status(500).json({ error: { message: 'Internal server error while processing scan: ' + err.message } });
  }
}
