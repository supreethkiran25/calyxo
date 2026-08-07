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

  // Step 1: Strip markdown fences if present
  let clean = rawText.replace(/```json|```/gi, '').trim();

  // Direct JSON parse attempt
  try {
    return JSON.parse(clean);
  } catch (e) {
    // Step 2: Extract JSON object substring using Regex
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

function parseGeminiStatusError(status, data, defaultMsg) {
  const geminiMessage = data?.error?.message || data?.message;

  if (status === 429) {
    return "You've reached the Gemini API rate limit. Please wait a minute and try again, or upgrade your API quota.";
  }
  if (status === 400) {
    return geminiMessage || "Invalid image payload or request parameters. Try taking another photo.";
  }
  if (status === 401) {
    return "Invalid Gemini API key. Please check your environment key configuration.";
  }
  if (status === 403) {
    return "Access denied to Gemini API. Check API key permissions and billing status.";
  }
  if (status === 404) {
    return "Requested Gemini model endpoint was not found.";
  }
  if (status === 408) {
    return "Request timed out while analyzing image. Please try again.";
  }
  if (status === 413) {
    return "Image payload size is too large. Image rescaled automatically.";
  }
  if (status === 500 || status === 503) {
    return geminiMessage || "Gemini AI service is temporarily busy or unavailable. Retrying...";
  }

  return geminiMessage || defaultMsg || `Gemini API error (HTTP ${status}).`;
}

async function fetchWithRetry(url, options, maxRetries = 2) {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      console.log(`[FoodScan] Requesting ${url} (Attempt ${attempt + 1}/${maxRetries + 1})`);
      const response = await fetch(url, options);
      const data = await response.json().catch(() => ({}));

      if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return { ok: true, status: response.status, data, text: data.candidates[0].content.parts[0].text };
      }

      const status = response.status;
      const isRateLimitOrBusy = status === 429 || status === 503;

      if (isRateLimitOrBusy && attempt < maxRetries) {
        const retryAfterHeader = response.headers.get('Retry-After') || response.headers.get('retry-after-ms');
        let delayMs = Math.pow(2, attempt) * 1500;
        if (retryAfterHeader) {
          const parsedHeader = parseInt(retryAfterHeader);
          if (!isNaN(parsedHeader)) {
            delayMs = parsedHeader > 100 ? parsedHeader : parsedHeader * 1000;
          }
        }
        console.warn(`[FoodScan] HTTP ${status} rate limit. Exponential backoff delay ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        attempt++;
        continue;
      }

      return { ok: false, status, data };
    } catch (e) {
      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt) * 1500;
        console.warn(`[FoodScan] Network exception: ${e.message}. Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        attempt++;
        continue;
      }
      return { ok: false, status: 0, error: e };
    }
  }
}

export async function scanFoodImage(base64Image) {
  // Sanitize base64 string for Android / Web compatibility
  const cleanBase64 = (base64Image || '')
    .replace(/^data:image\/[a-z]+;base64,/, '')
    .replace(/[\r\n\s]/g, '');

  console.log("[FoodScan] Starting image scan. Clean Base64 size:", cleanBase64.length);

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || 'AIzaSyC_kwCmfgILI3UirtKpyxnhTNDhXMHvsZ4';

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

  const isNativeCapacitor = typeof window !== 'undefined' && (
    window.Capacitor?.isNativePlatform?.() ||
    window.location.protocol === 'capacitor:' ||
    window.location.hostname === 'localhost'
  );

  let rawText = null;
  let lastStatus = 0;
  let lastData = null;

  // 1. Try local serverless proxy /api/gemini first ONLY on browser web (skip relative fetch on Capacitor Android)
  if (!isNativeCapacitor) {
    try {
      console.log("[FoodScan] Querying backend proxy /api/gemini...");
      const result = await fetchWithRetry('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gemini-2.5-flash', payload })
      }, 1);

      if (result.ok && result.text) {
        rawText = result.text;
        console.log("[FoodScan] Successfully received text from /api/gemini proxy.");
      } else {
        lastStatus = result.status;
        lastData = result.data;
        console.warn(`[FoodScan] Proxy query failed with status ${result.status}`);
      }
    } catch (e) {
      console.warn("[FoodScan] Proxy fetch exception:", e.message);
    }
  }

  // 2. Direct Gemini REST API fetch with model retries & backoff (Primary for Android Capacitor, fallback for Web)
  if (!rawText) {
    const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];

    for (const modelName of modelsToTry) {
      console.log(`[FoodScan] Querying Gemini endpoint model: ${modelName} (isNative: ${isNativeCapacitor})`);
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      
      const result = await fetchWithRetry(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }, 1);

      if (result.ok && result.text) {
        rawText = result.text;
        console.log(`[FoodScan] Received response from direct model ${modelName}`);
        break;
      } else {
        lastStatus = result.status || lastStatus;
        lastData = result.data || lastData;
        console.warn(`[FoodScan] Direct model ${modelName} status ${result.status}`);

        // If rate limit (429), break model loop to show rate limit error immediately
        if (result.status === 429) {
          break;
        }
      }
    }
  }

  if (!rawText) {
    console.error("[FoodScan] All Gemini API endpoints failed. Status:", lastStatus, lastData);
    const specificError = parseGeminiStatusError(lastStatus, lastData, 'Gemini API unreachable. Please check your connection and API key configuration.');
    throw new Error(specificError);
  }

  console.log("[FoodScan] Raw response text:", rawText);

  const parsed = extractJsonFromText(rawText);

  if (!parsed) {
    console.error("[FoodScan] Failed to parse JSON from Gemini text output.");
    throw new Error('Gemini returned unformatted response. Please retry with a clearer photo.');
  }

  console.log("[FoodScan] Parsed JSON object:", parsed);

  if (parsed.error === 'not_food') {
    throw new Error('No food detected in this image. Try again with a clearer photo of a meal.');
  }
  if (parsed.error === 'unclear_image') {
    throw new Error('Image too dark or blurry. Move to better lighting and try again.');
  }

  // Map field variants with safe defaults
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

  const finalResult = {
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

  console.log("[FoodScan] Final mapped scan result:", finalResult);
  return finalResult;
}
