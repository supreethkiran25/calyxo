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

const supabaseUrl = getEnvVal('SUPABASE_URL') || 'https://nwcatvlfoayzrwatvyrf.supabase.co';
const supabaseAnonKey = getEnvVal('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53Y2F0dmxmb2F5enJ3YXR2eXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjIwNDQsImV4cCI6MjA5OTU5ODA0NH0.Y0S17EapVx86R1PlEBZZDxrm12VTwYq-fm-G6BsRRLc';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials not found. Falling back to Mock Mode.");
} else {
  console.log("Supabase URL initialized:", supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
