import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, serviceKey);

async function run() {
  const sql = fs.readFileSync('supabase/migrations/02_assigned_plans.sql', 'utf8');
  console.log("Attempting to run migration SQL...");
  
  // Try common SQL execution RPC names
  const rpcs = ['exec_sql', 'run_sql', 'execute_sql', 'exec', 'sql'];
  for (const rpc of rpcs) {
    console.log(`Trying RPC: ${rpc}`);
    const { data, error } = await supabase.rpc(rpc, { sql_query: sql, query: sql, sql: sql });
    if (!error) {
      console.log(`✅ Success via RPC: ${rpc}`, data);
      return;
    }
    console.log(`❌ Failed RPC: ${rpc} - ${error.message}`);
  }
}
run();
