/**
 * Calyxo AI Food Vision Service
 * Architecture:
 * Primary: Client -> Backend (/api/food-scan) -> Gemini -> Frontend
 * Fallback: Direct Gemini REST API call if backend endpoint is unreachable locally
 */

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
        console.warn("[FoodScan] Regex JSON parse error:", err);
      }
    }
  }
  return null;
}

export async function scanFoodImage(base64Image, requestId = null) {
  const reqId = requestId || `scan_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  const cleanBase64 = (base64Image || '')
    .replace(/^data:image\/[a-z]+;base64,/, '')
    .replace(/[\r\n\s]/g, '');

  console.log(`[FoodScan:${reqId}] Client scan initiated. Base64 length: ${cleanBase64.length}`);

  if (!cleanBase64 || cleanBase64.length < 50) {
    console.error(`[FoodScan:${reqId}] Invalid or truncated image payload.`);
    throw new Error('Invalid image payload. Please retake or re-select photo.');
  }

  // Detect strictly native Capacitor platform (do NOT match localhost browser)
  const isNativeCapacitor = typeof window !== 'undefined' && (
    Boolean(window.Capacitor?.isNativePlatform?.()) ||
    window.location.protocol === 'capacitor:'
  );

  const backendEndpoint = isNativeCapacitor
    ? 'https://calyxo.app/api/food-scan'
    : '/api/food-scan';

  console.log(`[FoodScan:${reqId}] Dispatching request to backend: ${backendEndpoint} (isNative: ${isNativeCapacitor})`);

  let lastError = null;

  // 1. Primary: Try backend endpoint (/api/food-scan)
  try {
    const response = await fetch(backendEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        base64Image: cleanBase64,
        requestId: reqId
      })
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok && data.success && data.result) {
      console.log(`[FoodScan:${reqId}] Backend scan successful: ${data.result.food_name} (${data.result.calories} kcal)`);
      return data.result;
    }

    if (!response.ok) {
      console.warn(`[FoodScan:${reqId}] Backend API status ${response.status}:`, data);
      const errMsg = data?.error?.message || data?.message;

      if (response.status === 429) {
        throw new Error("You've reached the Gemini API rate limit. Please wait a minute and try again, or upgrade your API quota.");
      }
      if (response.status === 400) {
        throw new Error(errMsg || "Invalid image payload or request parameters. Try taking another photo.");
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error("AI service authentication issue. Please contact support.");
      }
      
      lastError = new Error(errMsg || `AI food scan service status ${response.status}.`);
    }
  } catch (err) {
    console.warn(`[FoodScan:${reqId}] Backend endpoint fetch exception:`, err.message);
    lastError = err;
  }

  // 2. Direct Gemini REST API Fallback (for local dev server or if backend is unreachable)
  const apiKey = (typeof process !== 'undefined' && process.env ? (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY) : '') || '';

  if (apiKey) {
    try {
      console.log(`[FoodScan:${reqId}] Executing direct Gemini REST API fallback...`);
      const payload = {
        contents: [{
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: FOOD_SCAN_PROMPT }
          ]
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 512 }
      };

      const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(directUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const rawText = data.candidates[0].content.parts[0].text;
        const parsed = extractJsonFromText(rawText);

        if (parsed && !parsed.error) {
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
            notes: parsed.notes || null
          };
          console.log(`[FoodScan:${reqId}] Direct Gemini API fallback successful: ${result.food_name}`);
          return result;
        }
      } else if (response.status === 429) {
        throw new Error("You've reached the Gemini API rate limit. Please wait a minute and try again, or upgrade your API quota.");
      }
    } catch (directErr) {
      console.warn(`[FoodScan:${reqId}] Direct Gemini fallback exception:`, directErr.message);
      if (directErr.message.includes('rate limit')) throw directErr;
    }
  }

  throw lastError || new Error("Failed to connect to AI Food Scan service. Please check your internet connection.");
}
