/**
 * Calyxo Production AI Food Vision Service
 * Architecture: Client -> Backend (/api/food-scan) -> Gemini -> Frontend
 */

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

  // Detect if running on Native Android/iOS Capacitor
  const isNativeCapacitor = typeof window !== 'undefined' && (
    window.Capacitor?.isNativePlatform?.() ||
    window.location.protocol === 'capacitor:' ||
    window.location.hostname === 'localhost'
  );

  // Endpoint routing: Web calls relative /api/food-scan; Native Capacitor calls server origin
  const backendEndpoint = isNativeCapacitor
    ? 'https://calyxo.app/api/food-scan'
    : '/api/food-scan';

  console.log(`[FoodScan:${reqId}] Dispatching request to backend: ${backendEndpoint}`);

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
      console.log(`[FoodScan:${reqId}] Scan successful. Result: ${data.result.food_name} (${data.result.calories} kcal)`);
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

      throw new Error(errMsg || `AI food scan service returned status ${response.status}. Please retry.`);
    }

    throw new Error("Invalid response format from AI service. Please retry with a clearer photo.");

  } catch (err) {
    console.error(`[FoodScan:${reqId}] Exception:`, err.message);
    throw err;
  }
}
