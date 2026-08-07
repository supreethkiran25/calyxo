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

export async function scanFoodImage(base64Image) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  const payload = {
    contents: [{
      parts: [
        {
          inline_data: {
            mime_type: 'image/jpeg',
            data: base64Image
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

  const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];
  let rawText = null;

  // Try direct fetch first with model fallback
  for (const modelName of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) break;
      }
    } catch (e) {
      console.warn(`Direct fetch failed for ${modelName}`, e);
    }
  }

  // Fallback to local serverless proxy /api/gemini if direct call was blocked
  if (!rawText) {
    try {
      const proxyRes = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gemini-2.0-flash', payload })
      });
      if (proxyRes.ok) {
        const data = await proxyRes.json();
        rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      }
    } catch (e) {
      console.warn("Proxy fallback error", e);
    }
  }

  if (!rawText) throw new Error('No response from Gemini Vision. Try again with a clearer photo.');

  // Strip any accidental markdown fences
  const clean = rawText.replace(/```json|```/gi, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch {
    throw new Error('Gemini returned invalid JSON — try again');
  }

  if (parsed.error === 'not_food') {
    throw new Error('No food detected in this image. Try again with a clearer photo.');
  }
  if (parsed.error === 'unclear_image') {
    throw new Error('Image too dark or blurry. Move to better lighting and try again.');
  }

  // Validate required fields
  const required = ['food_name', 'calories', 'protein_g', 'carbs_g', 'fat_g'];
  for (const field of required) {
    if (parsed[field] === undefined || parsed[field] === null) {
      throw new Error(`Incomplete scan result — missing ${field}. Try again.`);
    }
  }

  return {
    food_name: parsed.food_name,
    estimated_grams: parsed.estimated_grams || 100,
    confidence: parsed.confidence || 'medium',
    calories: Math.round(parsed.calories),
    protein_g: parseFloat((parsed.protein_g || 0).toFixed(1)),
    carbs_g: parseFloat((parsed.carbs_g || 0).toFixed(1)),
    fat_g: parseFloat((parsed.fat_g || 0).toFixed(1)),
    fiber_g: parseFloat((parsed.fiber_g || 0).toFixed(1)),
    serving_description: parsed.serving_description || `~${parsed.estimated_grams || 100}g`,
    notes: parsed.notes || null
  };
}
