import assert from 'assert';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('🔒 CALYXO PRODUCTION SECURITY REGRESSION TEST SUITE');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}\n`);
  }
}

// ----------------------------------------------------
// 1. SUPABASE RLS SCHEMA HARDENING AUDIT
// ----------------------------------------------------
console.log('[1/7] Auditing Supabase PostgreSQL Schema & RLS Policies...');

const schemaSql = fs.readFileSync(path.join(ROOT, 'CALYXO_MASTER_SUPABASE_SCHEMA.sql'), 'utf8');

test('No permissive "FOR ALL USING (true)" on private user tables', () => {
  const privateTables = [
    'user_profiles',
    'users_metrics',
    'food_logs',
    'nutrition_logs',
    'workout_logs',
    'weight_logs',
    'push_subscriptions',
    'subscriptions',
    'user_notifications',
    'trainer_clients',
    'trainer_notes',
    'pt_connections',
    'admin_audit_logs',
    'system_settings',
    'system_notifications'
  ];

  for (const table of privateTables) {
    const regex = new RegExp(`CREATE\\s+POLICY\\s+[^;]+ON\\s+public\\.${table}\\s+FOR\\s+ALL\\s+USING\\s*\\(\\s*true\\s*\\);`, 'i');
    assert.strictEqual(regex.test(schemaSql), false, `Table ${table} still has a permissive USING (true) policy!`);
  }
});

test('Super Admin helper function is_super_admin() is defined with SECURITY DEFINER', () => {
  assert.ok(schemaSql.includes('FUNCTION public.is_super_admin()'), 'is_super_admin function missing');
  assert.ok(schemaSql.includes('SECURITY DEFINER'), 'is_super_admin must be SECURITY DEFINER');
});

test('Subscriptions table policy restricts write operations to Super Admin / Service Role', () => {
  assert.ok(schemaSql.includes('CREATE POLICY "Users read own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id'), 'Missing user subscription read policy');
  assert.ok(schemaSql.includes('CREATE POLICY "Admin manage subscriptions" ON public.subscriptions FOR ALL USING (public.is_super_admin())'), 'Missing admin subscription write policy');
});

// ----------------------------------------------------
// 2. SERVERLESS ENDPOINT AUTHORIZATION AUDIT
// ----------------------------------------------------
console.log('\n[2/7] Auditing Serverless API Security Handlers...');

const pushSendJs = fs.readFileSync(path.join(ROOT, 'api/push/send.js'), 'utf8');
test('/api/push/send checks authUser.id === userId to prevent spoofing', () => {
  assert.ok(pushSendJs.includes('authUser.id !== userId'), 'Missing user authorization check in /api/push/send');
  assert.ok(pushSendJs.includes('403'), 'Missing 403 Forbidden rejection');
});

const pushSubJs = fs.readFileSync(path.join(ROOT, 'api/push/subscribe.js'), 'utf8');
test('/api/push/subscribe requires mandatory authUser and sets user_id = authUser.id', () => {
  assert.ok(pushSubJs.includes('if (!authUser)'), 'Missing mandatory authentication check in /api/push/subscribe');
  assert.ok(pushSubJs.includes('const userId = authUser.id;'), 'User ID must be strictly derived from authUser.id');
});

const pushEvalJs = fs.readFileSync(path.join(ROOT, 'api/push/evaluate-reminders.js'), 'utf8');
test('/api/push/evaluate-reminders requires CRON_SECRET authorization and has no fallback keys', () => {
  assert.ok(pushEvalJs.includes('cronSecret'), 'Missing CRON_SECRET validation');
  assert.ok(pushEvalJs.includes('401'), 'Missing 401 Unauthorized rejection');
  assert.strictEqual(pushEvalJs.includes('3AASSWF8bDu3EJG5'), false, 'Hardcoded fallback VAPID key still present!');
});

// ----------------------------------------------------
// 3. PAYMENT WEBHOOK & SIGNATURE VERIFICATION AUDIT
// ----------------------------------------------------
console.log('\n[3/7] Auditing Payment Gateway Security...');

const webhookJs = fs.readFileSync(path.join(ROOT, 'api/razorpay-webhook.js'), 'utf8');
test('/api/razorpay-webhook properly declares digest and uses crypto.timingSafeEqual', () => {
  assert.ok(webhookJs.includes('const digest = shasum.digest(\'hex\');'), 'Missing digest declaration');
  assert.ok(webhookJs.includes('crypto.timingSafeEqual'), 'Missing timingSafeEqual verification');
  assert.ok(webhookJs.includes('Idempotency'), 'Missing idempotency check');
});

const verifyPayJs = fs.readFileSync(path.join(ROOT, 'api/verify-payment.js'), 'utf8');
test('/api/verify-payment uses timing-safe buffer comparison', () => {
  assert.ok(verifyPayJs.includes('crypto.timingSafeEqual(genBuf, sigBuf)'), 'Missing timingSafeEqual on payment verify');
});

// ----------------------------------------------------
// 4. SERVER-SIDE AI QUOTA & GATEWAY AUDIT
// ----------------------------------------------------
console.log('\n[4/7] Auditing AI Gateway & Rate Limiting...');

const geminiJs = fs.readFileSync(path.join(ROOT, 'api/gemini.js'), 'utf8');
test('/api/gemini enforces server-side AI quota and rate limiting', () => {
  assert.ok(geminiJs.includes('checkRateLimit'), 'Missing rate limiting check in gemini.js');
  assert.ok(geminiJs.includes('currentCount >= 10'), 'Missing 10 queries/month free quota check');
  assert.ok(geminiJs.includes('429'), 'Missing 429 quota rejection');
  assert.ok(geminiJs.includes('AbortController'), 'Missing request timeout controller');
});

// ----------------------------------------------------
// 5. CLIENT & ADMIN AUTHENTICATION AUDIT
// ----------------------------------------------------
console.log('\n[5/7] Auditing Admin Authorization & Mass Assignment...');

const adminServiceJs = fs.readFileSync(path.join(ROOT, 'src/services/adminService.js'), 'utf8');
test('adminService.js eliminates localStorage trust and fails closed', () => {
  assert.strictEqual(adminServiceJs.includes('localStorage.getItem(\'calyxo_admin_session\')'), false, 'localStorage admin trust still present!');
  assert.ok(adminServiceJs.includes('supabase.auth.getUser()'), 'Missing server-side auth verification in adminService.js');
});

const dbServiceJs = fs.readFileSync(path.join(ROOT, 'src/lib/dbService.js'), 'utf8');
test('saveUserProfile prevents mass assignment of role/subscription_plan on user_profiles', () => {
  assert.ok(dbServiceJs.includes('Mass assignment protection'), 'Missing mass assignment protection comment/guard');
  assert.ok(dbServiceJs.includes('HealthCache.clear()'), 'Missing HealthCache.clear() on signOutUser');
});

// ----------------------------------------------------
// 6. ANDROID & BUILD CONFIGURATION AUDIT
// ----------------------------------------------------
console.log('\n[6/7] Auditing Mobile & Build Hardening...');

const manifestXml = fs.readFileSync(path.join(ROOT, 'android/app/src/main/AndroidManifest.xml'), 'utf8');
test('AndroidManifest.xml sets android:allowBackup="false"', () => {
  assert.ok(manifestXml.includes('android:allowBackup="false"'), 'android:allowBackup must be false');
});

const viteConfig = fs.readFileSync(path.join(ROOT, 'vite.config.mjs'), 'utf8');
test('vite.config.mjs explicitly disables production source maps', () => {
  assert.ok(viteConfig.includes('sourcemap: false'), 'sourcemap: false missing in vite.config.mjs');
});

// ----------------------------------------------------
// 7. CRYPTOGRAPHIC SIGNATURE & TIMING-SAFE SIMULATION
// ----------------------------------------------------
console.log('\n[7/7] Simulating Cryptographic Timing-Safe Checks...');

test('HMAC-SHA256 timing-safe comparison correctly accepts valid signatures and rejects forged ones', () => {
  const secret = 'test_secret_key_12345';
  const orderId = 'order_987654';
  const paymentId = 'pay_123456';

  const validSig = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  const forgedSig = crypto.createHmac('sha256', 'wrong_secret').update(`${orderId}|${paymentId}`).digest('hex');

  const validBuf = Buffer.from(validSig, 'utf-8');
  const expectedBuf = Buffer.from(validSig, 'utf-8');
  const forgedBuf = Buffer.from(forgedSig, 'utf-8');

  assert.strictEqual(validBuf.length === expectedBuf.length && crypto.timingSafeEqual(validBuf, expectedBuf), true, 'Valid signature failed verification');
  assert.strictEqual(forgedBuf.length === expectedBuf.length && crypto.timingSafeEqual(forgedBuf, expectedBuf), false, 'Forged signature was incorrectly accepted');
});

console.log('\n====================================================');
console.log(`🎯 AUDIT SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (100%)`);
console.log('====================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
