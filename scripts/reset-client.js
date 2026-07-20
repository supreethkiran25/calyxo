import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, serviceKey);

const clientUserId = '5f9535f7-14ee-4100-b461-786f52123f47';

async function run() {
  console.log('Resetting client state for onboarding...');
  
  // 1. Delete users_metrics profile row
  const { error: err1 } = await supabase.from('users_metrics').delete().eq('id', `${clientUserId}_profile`);
  console.log('Deleted users_metrics profile:', err1 || 'SUCCESS');

  // 2. Delete users_ecosystem row
  const { error: err2 } = await supabase.from('users_ecosystem').delete().eq('id', clientUserId);
  console.log('Deleted users_ecosystem:', err2 || 'SUCCESS');

  // 3. Reset user_profiles role
  const { error: err3 } = await supabase.from('user_profiles').delete().eq('id', clientUserId);
  console.log('Deleted user_profiles row:', err3 || 'SUCCESS');

  console.log('Reset finished successfully.');
}
run();
