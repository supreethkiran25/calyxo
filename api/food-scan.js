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

// Models sorted by quota priority (if primary model reaches 429, seamlessly fallback)
const GEMINI_VISION_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-lite'
];

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

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error(`[ServerFoodScan:${reqId}] GEMINI_API_KEY environment variable is not configured.`);
    return res.status(500).json({ error: { message: 'Gemini API key is not configured on server.' } });
  }

  const payload = {
    contents: [{
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
        { text: FOOD_SCAN_PROMPT }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 512
    }
  };

  let lastResponseData = null;
  let lastStatus = 500;

  // Seamless Multi-Model Fallback Pool to Bypass 429 Quotas
  for (const modelName of GEMINI_VISION_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    try {
      console.log(`[ServerFoodScan:${reqId}] Attempting vision scan with model ${modelName}...`);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      lastStatus = response.status;
      lastResponseData = await response.json().catch(() => ({}));

      if (response.ok) {
        const rawText = lastResponseData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = extractJsonFromText(rawText);
          if (parsed) {
            if (parsed.error === 'not_food') {
              return res.status(400).json({ error: { message: 'No food detected in this image. Try again with a clearer photo of a meal.' } });
            }
            if (parsed.error === 'unclear_image') {
              return res.status(400).json({ error: { message: 'Image too dark or blurry. Move to better lighting and try again.' } });
            }

            const result = {
              food_name: parsed.food_name || parsed.name || "Scanned Meal",
              estimated_grams: Number(parsed.estimated_grams || parsed.grams) || 100,
              confidence: parsed.confidence || 'medium',
              calories: Math.round(Number(parsed.calories) || 200),
              protein_g: parseFloat((Number(parsed.protein_g || parsed.protein) || 0).toFixed(1)),
              carbs_g: parseFloat((Number(parsed.carbs_g || parsed.carbs) || 0).toFixed(1)),
              fat_g: parseFloat((Number(parsed.fat_g || parsed.fat) || 0).toFixed(1)),
              fiber_g: parseFloat((Number(parsed.fiber_g || parsed.fiber) || 0).toFixed(1)),
              serving_description: parsed.serving_description || `~${parsed.estimated_grams || 100}g`,
              notes: parsed.notes || null,
              model_used: modelName
            };

            console.log(`[ServerFoodScan:${reqId}] Success with model ${modelName}: ${result.food_name} (${result.calories} kcal)`);
            return res.status(200).json({ success: true, result });
          }
        }
      }

      if (response.status === 429) {
        console.warn(`[ServerFoodScan:${reqId}] Model ${modelName} hit 429 rate limit. Trying next candidate model...`);
        continue;
      }

      // Non-429 client errors (e.g. 400 invalid image) don't need model fallback
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return res.status(response.status).json(lastResponseData);
      }

    } catch (err) {
      console.warn(`[ServerFoodScan:${reqId}] Exception for model ${modelName}:`, err.message);
    }
  }

  // All candidate models failed or rate-limited
  if (lastStatus === 429) {
    return res.status(429).json({
      error: {
        code: 429,
        message: "You've reached the Gemini API rate limit across all models. Please wait a minute and try again."
      }
    });
  }

  return res.status(lastStatus || 500).json(lastResponseData || { error: { message: 'AI Vision analysis service unavailable.' } });
}
