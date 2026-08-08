import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const GEMINI_VISION_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-lite'
];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    plugins: [
      react(),
      {
        name: 'local-api-proxy',
        configureServer(server) {
          // Proxy /api/food-scan locally for dev environment
          server.middlewares.use('/api/food-scan', async (req, res) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

            if (req.method === 'OPTIONS') {
              res.statusCode = 200;
              res.end();
              return;
            }

            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: { message: 'Method not allowed' } }));
              return;
            }

            try {
              let bodyStr = '';
              for await (const chunk of req) {
                bodyStr += chunk;
              }
              const body = JSON.parse(bodyStr || '{}');
              const { base64Image, requestId } = body;
              const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

              if (!apiKey) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: { message: 'Gemini API key is not configured on server.' } }));
                return;
              }

              const cleanBase64 = (base64Image || '')
                .replace(/^data:image\/[a-z]+;base64,/, '')
                .replace(/[\r\n\s]/g, '');

              if (!cleanBase64 || cleanBase64.length < 50) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: { message: 'Invalid or missing base64Image payload.' } }));
                return;
              }

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
}`;

              const payload = {
                contents: [{
                  parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
                    { text: FOOD_SCAN_PROMPT }
                  ]
                }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 512 }
              };

              let lastStatus = 500;
              let lastData = {};

              // Model pool fallback loop for local dev server
              for (const modelName of GEMINI_VISION_MODELS) {
                const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
                const fetchRes = await fetch(googleUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });

                lastStatus = fetchRes.status;
                lastData = await fetchRes.json().catch(() => ({}));

                if (fetchRes.ok) {
                  const rawText = lastData?.candidates?.[0]?.content?.parts?.[0]?.text;
                  let cleanText = (rawText || '').replace(/```json|```/gi, '').trim();
                  let parsed = null;
                  try {
                    parsed = JSON.parse(cleanText);
                  } catch {
                    const match = cleanText.match(/\{[\s\S]*\}/);
                    if (match) {
                      try { parsed = JSON.parse(match[0]); } catch {}
                    }
                  }

                  if (parsed) {
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

                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true, result }));
                    return;
                  }
                }

                if (fetchRes.status === 429 || fetchRes.status === 404 || fetchRes.status === 400) {
                  console.warn(`[DevServerFoodScan] Model ${modelName} returned status ${fetchRes.status}. Trying next model...`);
                  continue;
                }
              }

              res.statusCode = lastStatus;
              res.setHeader('Content-Type', 'application/json');
              if (lastStatus === 429) {
                res.end(JSON.stringify({
                  error: {
                    code: 429,
                    message: "You've reached the Gemini API rate limit. Please wait a minute and try again, or upgrade your API quota."
                  }
                }));
                return;
              }
              res.end(JSON.stringify(lastData));

            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: { message: err.message } }));
            }
          });
        }
      }
    ],
    define: {
      'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL || ''),
      'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''),
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    build: {
      target: 'es2022',
      cssMinify: true,
      modulePreload: { polyfill: false },
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('three') || id.includes('@react-three')) {
                return 'vendor-three';
              }
              if (id.includes('framer-motion')) {
                return 'vendor-framer';
              }
              if (id.includes('@supabase')) {
                return 'vendor-supabase';
              }
              if (id.includes('recharts') || id.includes('lucide-react')) {
                return 'vendor-charts';
              }
              return 'vendor';
            }
          }
        }
      }
    }
  };
});
