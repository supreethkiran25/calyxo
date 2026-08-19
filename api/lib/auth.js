import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'https://calyxo.vercel.app',
  'capacitor://localhost',
  'http://localhost'
];

/**
 * Configure secure CORS headers based on request origin.
 */
export function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin && (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS[0]);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
}

/**
 * Cryptographically verify JWT using HMAC-SHA256 signature with JWT_SECRET,
 * or fallback to Supabase Auth token validation.
 */
export async function verifyAuthUser(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  if (!token) return null;

  // 1. Try cryptographic HMAC SHA-256 verification using JWT_SECRET
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const [headerB64, payloadB64, signatureB64] = parts;

        // Verify header specifies HS256
        const headerJson = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
        if (headerJson.alg === 'HS256') {
          const expectedSig = crypto
            .createHmac('sha256', jwtSecret)
            .update(`${headerB64}.${payloadB64}`)
            .digest('base64url');

          if (crypto.timingSafeEqual(Buffer.from(signatureB64), Buffer.from(expectedSig))) {
            const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
            const now = Math.floor(Date.now() / 1000);

            // Check expiration & not before claims
            if (payload.exp && payload.exp < now) {
              return null; // Expired token
            }
            if (payload.nbf && payload.nbf > now) {
              return null;
            }

            const userId = payload.sub || payload.user_id || payload.id;
            if (userId) {
              return {
                id: userId,
                email: payload.email || '',
                role: payload.role || payload.user_metadata?.role || 'authenticated'
              };
            }
          }
        }
      }
    } catch (e) {
      // Signature check failed or non-standard token format; proceed to Supabase Auth fallback
    }
  }

  // 2. Fallback to Supabase Auth API token validation
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        return {
          id: user.id,
          email: user.email,
          role: user.role || user.user_metadata?.role || 'authenticated'
        };
      }
    } catch (e) {
      console.warn('[ServerAuth] Supabase token verification failed:', e.message);
    }
  }

  return null;
}
