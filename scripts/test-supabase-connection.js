import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, anonKey);

async function test() {
  const { data, error } = await supabase.auth.signUp({
    email: `test_user_${Date.now()}@example.com`,
    password: 'password123'
  });
  console.log('SignUp result:', { data, error });
  if (data?.user) {
    // try to insert profile
    const { error: profileError } = await supabase.from('user_profiles').insert({
      id: data.user.id,
      email: data.user.email,
      nickname: 'Test User'
    });
    console.log('Profile insert:', profileError);
  }
}
test();
