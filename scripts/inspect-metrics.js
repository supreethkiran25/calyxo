import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, serviceKey);

async function run() {
  const { data, error } = await supabase.from('users_metrics').select('*').limit(1);
  if (error) {
    console.error('Error fetching users_metrics:', error);
  } else {
    console.log('First Row:', data?.[0]);
    console.log('Table Columns:', Object.keys(data?.[0] || {}));
  }
}
run();
