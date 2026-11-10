import { createClient } from '@supabase/supabase-js';

const getEnvVal = (key) => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta && import.meta.env) {
      if (import.meta.env[key]) return import.meta.env[key];
      if (import.meta.env[`VITE_${key}`]) return import.meta.env[`VITE_${key}`];
      if (import.meta.env[`NEXT_PUBLIC_${key}`]) return import.meta.env[`NEXT_PUBLIC_${key}`];
    }
  } catch (e) {}
  try {
    if (typeof process !== 'undefined' && process && process.env) {
      if (process.env[key]) return process.env[key];
      if (process.env[`VITE_${key}`]) return process.env[`VITE_${key}`];
      if (process.env[`NEXT_PUBLIC_${key}`]) return process.env[`NEXT_PUBLIC_${key}`];
    }
  } catch (e) {}
  return undefined;
};

const supabaseUrl = getEnvVal('SUPABASE_URL');
const supabaseAnonKey = getEnvVal('SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
