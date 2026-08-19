import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://nwcatvlfoayzrwatvyrf.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53Y2F0dmxmb2F5enJ3YXR2eXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjIwNDQsImV4cCI6MjA5OTU5ODA0NH0.Y0S17EapVx86R1PlEBZZDxrm12VTwYq-fm-G6BsRRLc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
