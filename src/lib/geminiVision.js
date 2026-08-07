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

async function fetchWithRetry(url, options, reqId, maxRetries = 1) {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      console.log(`[FoodScan:${reqId}] Executing fetch to ${url} (Attempt ${attempt + 1}/${maxRetries + 1})`);
      const response = await fetch(url, options);
      const data = await response.json().catch(() => ({}));

      if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return { ok: true, status: response.status, data, text: data.candidates[0].content.parts[0].text };
      }

      const status = response.status;
      console.warn(`[FoodScan:${reqId}] HTTP ${status} response:`, data);

      if (status === 429 || status === 503) {
        if (attempt < maxRetries) {
          const retryAfterHeader = response.headers.get('Retry-After') || response.headers.get('retry-after-ms');
          let delayMs = Math.pow(2, attempt) * 2000;
          if (retryAfterHeader) {
            const parsedHeader = parseInt(retryAfterHeader);
            if (!isNaN(parsedHeader)) delayMs = parsedHeader > 100 ? parsedHeader : parsedHeader * 1000;
          }
          console.warn(`[FoodScan:${reqId}] Rate limit hit. Backoff delay ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          attempt++;
          continue;
        }
      }

      return { ok: false, status, data };
    } catch (e) {
      console.warn(`[FoodScan:${reqId}] Network exception:`, e.message);
      if (attempt < maxRetries) {
        const delayMs = 2000;
        await new Promise(resolve => setTimeout(resolve, delayMs));
        attempt++;
        continue;
      }
      return { ok: false, status: 0, error: e };
    }
  }
}

export async function scanFoodImage(base64Image, requestId = null) {
  const reqId = requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  const cleanBase64 = (base64Image || '')
    .replace(/^data:image\/[a-z]+;base64,/, '')
    .replace(/[\r\n\s]/g, '');

  console.log(`[FoodScan:${reqId}] Scan started. Payload base64 length: ${cleanBase64.length}`);

  if (!cleanBase64 || cleanBase64.length < 100) {
    console.error(`[FoodScan:${reqId}] Invalid or truncated base64 image data.`);
    throw new Error('Invalid or truncated image data. Please retake photo.');
  }

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

  // 1. Web browser: Query /api/gemini proxy once
  if (!isNativeCapacitor) {
    try {
      console.log(`[FoodScan:${reqId}] Querying backend proxy /api/gemini...`);
      const result = await fetchWithRetry('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gemini-2.5-flash', payload })
      }, reqId, 1);

      if (result.ok && result.text) {
        rawText = result.text;
        console.log(`[FoodScan:${reqId}] Proxy success.`);
      } else {
        lastStatus = result.status;
        lastData = result.data;
        console.warn(`[FoodScan:${reqId}] Proxy failed status: ${result.status}`);
      }
    } catch (e) {
      console.warn(`[FoodScan:${reqId}] Proxy exception:`, e.message);
    }
  }

  // 2. Native Android Capacitor / Fallback: Query primary model gemini-2.5-flash directly
  if (!rawText) {
    const primaryModel = 'gemini-2.5-flash';
    console.log(`[FoodScan:${reqId}] Direct query to Gemini model: ${primaryModel}`);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${primaryModel}:generateContent?key=${apiKey}`;
    
    const result = await fetchWithRetry(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, reqId, 1);

    if (result.ok && result.text) {
      rawText = result.text;
      console.log(`[FoodScan:${reqId}] Direct API success.`);
    } else {
      lastStatus = result.status || lastStatus;
      lastData = result.data || lastData;
      console.warn(`[FoodScan:${reqId}] Direct model ${primaryModel} failed status: ${result.status}`);
    }
  }

  if (!rawText) {
    console.error(`[FoodScan:${reqId}] Gemini request failed. Status: ${lastStatus}`, lastData);
    const specificError = parseGeminiStatusError(lastStatus, lastData, 'Gemini API unreachable. Please check connection and API key configuration.');
    throw new Error(specificError);
  }

  console.log(`[FoodScan:${reqId}] Raw Gemini response received:`, rawText.substring(0, 150) + "...");

  const parsed = extractJsonFromText(rawText);

  if (!parsed) {
    console.error(`[FoodScan:${reqId}] Failed to parse JSON from text:`, rawText);
    throw new Error('Gemini returned unformatted response. Please retry with a clearer photo.');
  }

  console.log(`[FoodScan:${reqId}] Parsed JSON:`, parsed);

  if (parsed.error === 'not_food') {
    throw new Error('No food detected in this image. Try again with a clearer photo of a meal.');
  }
  if (parsed.error === 'unclear_image') {
    throw new Error('Image too dark or blurry. Move to better lighting and try again.');
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

  console.log(`[FoodScan:${reqId}] Scan successful. Final result:`, finalResult.food_name, `${finalResult.calories} kcal`);
  return finalResult;
}
