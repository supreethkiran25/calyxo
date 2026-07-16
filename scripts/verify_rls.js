const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log("=== Running Checkpoint 3 Verification Tests ===\n");

  // TEST 1: Unauthorized Read Blocked
  console.log("TEST 1: Unauthorized Read Blocked");
  const { data: profiles, error: readError } = await supabase.from('user_profiles').select('*');
  if (readError) {
    console.log("✅ Passed (Expected error on read without auth):", readError.message);
  } else if (!profiles || profiles.length === 0) {
    console.log("✅ Passed (RLS successfully hid all profiles from unauthenticated read)");
  } else {
    console.log("❌ Failed (Able to read profiles unauthenticated!)");
  }

  // To test the rest of the RLS properly, we need authenticated test users.
  // Assuming test users are created via the Supabase dashboard or previous setup:
  console.log("\n(Further RLS tests require authenticated test users. Run tests with active sessions to verify 'self-approval blocked' and 'direct role writes blocked'.)\n");
  
  // Example of Direct Role Write Test:
  console.log("TEST 2: Direct Role/Plan Writes Blocked");
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ role: 'ADMIN', subscription_plan: 'PRO' })
    .eq('id', 'some-uuid');
    
  if (updateError) {
    console.log("✅ Passed (Expected error on role/plan update):", updateError.message);
  } else {
    console.log("⚠️ (Note: Test user not authenticated, but if it succeeded, it would fail the check)");
  }

  console.log("\n=== Tests Complete ===");
}

runTests();
