import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

const supabaseAdmin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const supabaseAnon = createClient(url, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const generateEmail = () => `test_${Date.now()}_${Math.floor(Math.random()*1000)}@testcalyxo.com`;

async function verifySchemaAndRLS() {
  console.log("--- VERIFYING COLUMNS ---");
  const { data: profileData, error: profileErr } = await supabaseAdmin.from('user_profiles').select('id, email, nickname, role, subscription_plan, created_at').limit(1);
  if (profileErr) {
    console.error("❌ [FAIL] Missing expected columns in user_profiles:", profileErr.message);
  } else {
    console.log("✅ [PASS] user_profiles has all expected columns (id, email, nickname, role, subscription_plan, created_at)");
  }

  const { data: relData, error: relErr } = await supabaseAdmin.from('relationships').select('id, requester_id, addressee_id, status, created_at, updated_at').limit(1);
  if (relErr) {
    console.error("❌ [FAIL] Missing expected columns in relationships:", relErr.message);
  } else {
    console.log("✅ [PASS] relationships has all expected columns (id, requester_id, addressee_id, status, created_at, updated_at). Note: 'scope' does NOT exist.");
  }

  console.log("\n--- VERIFYING RLS IS ACTIVE ---");
  // If RLS is active, an unauthenticated anon client should get 0 rows when reading a table
  // (Assuming there is no permissive anon policy, which there isn't in 01_init.sql)
  const { data: anonProfileData, error: anonProfileErr } = await supabaseAnon.from('user_profiles').select('*').limit(1);
  if (anonProfileErr) {
    console.log("✅ [PASS] RLS blocks unauthenticated access to user_profiles (Error: " + anonProfileErr.message + ")");
  } else if (anonProfileData && anonProfileData.length === 0) {
    console.log("✅ [PASS] RLS blocks unauthenticated access to user_profiles (0 rows returned)");
  } else {
    console.error("❌ [FAIL] RLS is NOT active or is too permissive on user_profiles! Returned data:", anonProfileData);
  }

  const { data: anonRelData, error: anonRelErr } = await supabaseAnon.from('relationships').select('*').limit(1);
  if (anonRelErr) {
    console.log("✅ [PASS] RLS blocks unauthenticated access to relationships");
  } else if (anonRelData && anonRelData.length === 0) {
    console.log("✅ [PASS] RLS blocks unauthenticated access to relationships (0 rows returned)");
  } else {
    console.error("❌ [FAIL] RLS is NOT active or is too permissive on relationships! Returned data:", anonRelData);
  }
}

async function createTestUser() {
  const email = generateEmail();
  const password = 'password123';
  
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true
  });
  if (error) throw error;
  
  await supabaseAdmin.from('user_profiles').insert({
    id: data.user.id, email: email, nickname: `User ${data.user.id.substring(0,5)}`
  });
  
  const client = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
  await client.auth.signInWithPassword({ email, password });
  
  return { id: data.user.id, client, email };
}

async function runTests() {
  await verifySchemaAndRLS();
  
  console.log("\nSetting up test users...");
  const userA = await createTestUser();
  const userB = await createTestUser();
  const userC = await createTestUser();
  
  let passed = 0;
  let failed = 0;
  
  const assertFail = (result, name) => {
    if (result.error) {
      console.log(`✅ [PASS] ${name} - Failed as expected: ${result.error.message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} - Succeeded when it should have failed`);
      failed++;
    }
  };
  
  const assertPass = (result, name) => {
    if (result.error) {
      console.error(`❌ [FAIL] ${name} - Failed when it should have succeeded: ${result.error.message}`);
      failed++;
    } else {
      console.log(`✅ [PASS] ${name} - Succeeded as expected`);
      passed++;
    }
  };

  console.log("\n--- 1. ROLE/SUBSCRIPTION PROTECTION ---");
  
  const roleUpdateResult = await userA.client.from('user_profiles').update({ role: 'admin' }).eq('id', userA.id);
  assertFail(roleUpdateResult, "Attempt to directly UPDATE own role to 'admin'");
  
  const subUpdateResult = await userA.client.from('user_profiles').update({ subscription_plan: 'PRO' }).eq('id', userA.id);
  assertFail(subUpdateResult, "Attempt to directly UPDATE own subscription_plan to 'PRO'");
  
  const adminUpdateResult = await supabaseAdmin.from('user_profiles').update({ role: 'admin', subscription_plan: 'PRO' }).eq('id', userA.id);
  assertPass(adminUpdateResult, "Service-role client CAN update both fields");
  
  console.log("\n--- 2. RELATIONSHIP TWO-SIDED ENFORCEMENT ---");
  
  const req1 = await userA.client.from('relationships').insert({ requester_id: userA.id, addressee_id: userB.id, status: 'PENDING' }).select().single();
  assertPass(req1, "User A creates a relationship request to User B (must succeed, status PENDING)");
  
  const acceptSelf = await userA.client.from('relationships').update({ status: 'ACCEPTED' }).eq('id', req1.data?.id);
  if (acceptSelf.error || acceptSelf.data === null || (Array.isArray(acceptSelf.data) && acceptSelf.data.length === 0)) {
     const verifyA = await supabaseAdmin.from('relationships').select('status').eq('id', req1.data?.id).single();
     if (verifyA.data?.status === 'PENDING') {
       console.log(`✅ [PASS] User A attempts to accept their own request - Failed as expected`);
       passed++;
     } else {
       console.error(`❌ [FAIL] User A attempts to accept their own request - Succeeded when it should have failed`);
       failed++;
     }
  }

  const acceptB = await userB.client.from('relationships').update({ status: 'ACCEPTED' }).eq('id', req1.data?.id).select();
  if (acceptB.error) {
    assertPass(acceptB, "User B (the addressee) updates status to ACCEPTED");
  } else if (acceptB.data && acceptB.data.length > 0) {
    console.log(`✅ [PASS] User B (the addressee) updates status to ACCEPTED`);
    passed++;
  } else {
    console.error(`❌ [FAIL] User B (the addressee) updates status to ACCEPTED - No rows updated`);
    failed++;
  }
  
  const readC = await userC.client.from('relationships').select().eq('id', req1.data?.id);
  if (readC.error) {
    assertFail(readC, "User C attempts to read this relationship row");
  } else if (readC.data && readC.data.length === 0) {
    console.log(`✅ [PASS] User C attempts to read this relationship row - Failed as expected (no rows visible)`);
    passed++;
  } else {
    console.error(`❌ [FAIL] User C attempts to read this relationship row - Succeeded when it should have failed`);
    failed++;
  }

  const reqDirectAccept = await userA.client.from('relationships').insert({ requester_id: userA.id, addressee_id: userC.id, status: 'ACCEPTED' });
  assertFail(reqDirectAccept, "User A attempts to create a relationship request directly as ACCEPTED");
  
  console.log("\n--- 3. SCOPED DATA VISIBILITY ---");
  
  const readC_byA = await userA.client.from('user_profiles').select().eq('id', userC.id);
  if (readC_byA.error) {
    assertFail(readC_byA, "User A cannot read User C's profile (no relationship)");
  } else if (readC_byA.data && readC_byA.data.length === 0) {
    console.log(`✅ [PASS] User A cannot read User C's profile (no relationship) - Hidden by RLS`);
    passed++;
  } else {
    console.error(`❌ [FAIL] User A cannot read User C's profile - Visible when it should be hidden`);
    failed++;
  }
  
  const readB_byA = await userA.client.from('user_profiles').select().eq('id', userB.id);
  if (readB_byA.error) {
    assertPass(readB_byA, "User A CAN read permitted scope of User B's data (ACCEPTED)");
  } else if (readB_byA.data && readB_byA.data.length > 0) {
    console.log(`✅ [PASS] User A CAN read permitted scope of User B's data (ACCEPTED)`);
    passed++;
  } else {
    console.error(`❌ [FAIL] User A CAN read permitted scope of User B's data - Hidden when it should be visible`);
    failed++;
  }

  await userA.client.from('relationships').insert({ requester_id: userA.id, addressee_id: userC.id, status: 'PENDING' });
  const readC_byA_pending = await userA.client.from('user_profiles').select().eq('id', userC.id);
  if (readC_byA_pending.error) {
    assertFail(readC_byA_pending, "User A cannot read User C's profile (PENDING relationship)");
  } else if (readC_byA_pending.data && readC_byA_pending.data.length === 0) {
    console.log(`✅ [PASS] User A cannot read User C's profile (PENDING relationship) - Hidden by RLS`);
    passed++;
  } else {
    console.error(`❌ [FAIL] User A cannot read User C's profile (PENDING relationship) - Visible when it should be hidden`);
    failed++;
  }

  console.log("\n--- 4. ASSIGNED PLANS RLS TESTS ---");

  // Upgrade User A's role to 'trainer' using service role (admin) so RLS role verification succeeds
  await supabaseAdmin.from('user_profiles').update({ role: 'trainer' }).eq('id', userA.id);
  
  // 4a. Trainer (User A) inserts assignment for Client (User B) - should succeed
  const assignResult = await userA.client.from('assigned_plans').insert({
    trainer_id: userA.id,
    client_id: userB.id,
    plan_type: 'workout',
    plan_data: { title: 'Test Plan', exercises: [] }
  }).select().single();
  assertPass(assignResult, "Trainer (User A) assigns workout plan to Client (User B)");

  const planId = assignResult.data?.id;

  // 4b. Trainer (User A) selects own assignments - should succeed
  const selectTrainerResult = await userA.client.from('assigned_plans').select().eq('id', planId);
  if (selectTrainerResult.data && selectTrainerResult.data.length > 0) {
    console.log(`✅ [PASS] Trainer (User A) can SELECT their own assignments`);
    passed++;
  } else {
    console.error(`❌ [FAIL] Trainer (User A) cannot SELECT their own assignments`);
    failed++;
  }

  // 4c. Client (User B) selects assignments assigned to them - should succeed
  const selectClientResult = await userB.client.from('assigned_plans').select().eq('id', planId);
  if (selectClientResult.data && selectClientResult.data.length > 0) {
    console.log(`✅ [PASS] Client (User B) can SELECT assignments assigned to them`);
    passed++;
  } else {
    console.error(`❌ [FAIL] Client (User B) cannot SELECT assignments assigned to them`);
    failed++;
  }

  // 4d. Client (User B) attempts to insert assignment - should fail (read-only, never write)
  const clientInsertResult = await userB.client.from('assigned_plans').insert({
    trainer_id: userB.id,
    client_id: userA.id,
    plan_type: 'workout',
    plan_data: { title: 'Cheater Plan' }
  });
  assertFail(clientInsertResult, "Client (User B) attempts to insert an assignment");

  // 4e. Third party (User C) attempts to select assignment - should fail (hide by RLS / 0 rows)
  const selectThirdResult = await userC.client.from('assigned_plans').select().eq('id', planId);
  if (selectThirdResult.error) {
    assertFail(selectThirdResult, "Third party (User C) attempts to select assignment");
  } else if (!selectThirdResult.data || selectThirdResult.data.length === 0) {
    console.log(`✅ [PASS] Third party (User C) cannot SELECT assignment (Hidden by RLS)`);
    passed++;
  } else {
    console.error(`❌ [FAIL] Third party (User C) can SELECT assignment when blocked`);
    failed++;
  }

  console.log(`\nTests finished: ${passed} passed, ${failed} failed.`);
  
  console.log("Cleaning up test users...");
  await supabaseAdmin.auth.admin.deleteUser(userA.id);
  await supabaseAdmin.auth.admin.deleteUser(userB.id);
  await supabaseAdmin.auth.admin.deleteUser(userC.id);
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
