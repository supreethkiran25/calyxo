export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let { model = 'gemini-1.5-flash', payload } = req.body || {};
  if (!model || model === 'gemini-2.5-flash') {
    model = 'gemini-1.5-flash';
  }
  
  // Retrieve API Key exclusively from Server Environment Variables (Completely hidden from browser clients)
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ 
      error: { 
        message: 'Server Gemini API key is not configured. Please add GEMINI_API_KEY in Vercel project environment settings.' 
      } 
    });
  }

  const modelsToTry = Array.from(new Set([model, 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro']));
  let lastData = null;
  let lastStatus = 500;

  try {
    for (const targetModel of modelsToTry) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      lastStatus = response.status;
      lastData = data;

      if (response.ok && data && !data.error) {
        return res.status(response.status).json(data);
      }
    }
    return res.status(lastStatus).json(lastData);
  } catch (error) {
    console.error("Serverless Gemini proxy exception:", error);
    return res.status(500).json({ error: { message: "Secure AI Proxy Exception: " + error.message } });
  }
}
