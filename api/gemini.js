import { setCorsHeaders, verifyAuthUser } from './lib/auth.js';

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authUser = await verifyAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: { message: 'Unauthorized access. Valid JWT bearer token required.' } });
  }


  let { model = 'gemini-2.5-flash', payload } = req.body || {};
  if (!model) {
    model = 'gemini-2.5-flash';
  }
  
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  const modelsToTry = [model, 'gemini-1.5-flash', 'gemini-2.0-flash'];
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

      // If rate limited (429) or client error (400, 401, 403), stop immediately — do not loop models
      if (response.status === 429 || response.status === 400 || response.status === 401 || response.status === 403) {
        return res.status(response.status).json(data);
      }
    }
    return res.status(lastStatus).json(lastData);
  } catch (error) {
    console.error("Serverless Gemini proxy exception:", error);
    return res.status(500).json({ error: { message: "Secure AI Proxy Exception: " + error.message } });
  }
}
