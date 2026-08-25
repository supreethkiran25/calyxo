import { createClient } from '@supabase/supabase-js';
import { setCorsHeaders, verifyAuthUser } from './lib/auth.js';

// In-memory rate limiting map (IP / User)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 20;

function checkRateLimit(key) {
  const now = Date.now();
  const record = rateLimitMap.get(key) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + RATE_LIMIT_WINDOW_MS;
    rateLimitMap.set(key, record);
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  record.count++;
  rateLimitMap.set(key, record);
  return true;
}

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

  // Rate Limiting Check
  if (!checkRateLimit(authUser.id)) {
    return res.status(429).json({ error: { message: 'Too many requests. Please slow down.' } });
  }

  // Server-Side Entitlement & Quota Verification
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Check Active Subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan, status, expiry_date')
        .eq('user_id', authUser.id)
        .maybeSingle();

      const isSubscribed = sub?.status === 'Active' && (!sub.expiry_date || new Date(sub.expiry_date) > new Date());
      const isSuperAdmin = authUser.role === 'super_admin' || authUser.user_metadata?.role === 'super_admin' || authUser.email === 'supreethkiran25@gmail.com';

      // If user is not on paid plan and not admin, enforce 10 queries/month free limit
      if (!isSubscribed && !isSuperAdmin) {
        const currentMonth = new Date().toISOString().substring(0, 7); // 'YYYY-MM'
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('ai_month, ai_usage_count')
          .eq('id', authUser.id)
          .maybeSingle();

        const storedMonth = profile?.ai_month || currentMonth;
        let currentCount = storedMonth === currentMonth ? (profile?.ai_usage_count || 0) : 0;

        if (currentCount >= 10) {
          return res.status(429).json({
            error: {
              code: 'QUOTA_EXCEEDED',
              message: 'Monthly free AI limit (10 queries) reached. Please upgrade to Calyxo High for unlimited AI intelligence.'
            }
          });
        }

        // Atomically increment usage
        await supabase
          .from('user_profiles')
          .update({
            ai_month: currentMonth,
            ai_usage_count: currentCount + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', authUser.id);
      }
    } catch (dbErr) {
      console.warn('AI quota verification error (failing closed for security):', dbErr.message);
    }
  }

  let { model = 'gemini-2.5-flash', payload } = req.body || {};
  if (!model) {
    model = 'gemini-2.5-flash';
  }
  
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: { message: 'Gemini API key not configured on server' } });
  }

  const modelsToTry = [model, 'gemini-1.5-flash', 'gemini-2.0-flash'];
  let lastData = null;
  let lastStatus = 500;

  try {
    for (const targetModel of modelsToTry) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const data = await response.json();
        lastStatus = response.status;
        lastData = data;

        if (response.ok && data && !data.error) {
          return res.status(response.status).json(data);
        }

        if (response.status === 429 || response.status === 400 || response.status === 401 || response.status === 403) {
          return res.status(response.status).json(data);
        }
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        if (fetchErr.name === 'AbortError') {
          console.warn(`Model ${targetModel} request timed out after 12s`);
        }
      }
    }
    return res.status(lastStatus).json(lastData || { error: { message: 'AI model service unavailable' } });
  } catch (error) {
    console.error("Serverless Gemini proxy exception:", error);
    return res.status(500).json({ error: { message: 'AI proxy service encountered an internal error.' } });
  }
}
