import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { setCorsHeaders, verifyAuthUser } from './lib/auth.js';

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authUser = await verifyAuthUser(req);

  // Authentication required — payment grants must always be scoped to the verified identity
  if (!authUser) {
    return res.status(401).json({
      success: false,
      error: { message: 'Unauthorized. A valid bearer token is required to verify a payment.' }
    });
  }

  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_secret) {
    return res.status(500).json({
      error: { message: 'RAZORPAY_KEY_SECRET is not configured on server' }
    });
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body || {};
  // SECURITY: targetUserId is always resolved from the verified JWT — never from client body
  const targetUserId = authUser.id;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      error: { message: 'Missing required payment verification parameters (razorpay_payment_id, razorpay_order_id, razorpay_signature)' }
    });
  }

  try {
    const generatedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const genBuf = Buffer.from(generatedSignature, 'utf-8');
    const sigBuf = Buffer.from(razorpay_signature, 'utf-8');

    if (genBuf.length !== sigBuf.length || !crypto.timingSafeEqual(genBuf, sigBuf)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Verification failed.'
      });
    }

    // Persist Subscription to Supabase DB if userId is present
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    const AUTHORITATIVE_PLANS = {
      HIGH: { amount: 2, planName: 'HIGH', durationDays: 30 },
      HIGH_MONTHLY: { amount: 2, planName: 'HIGH', durationDays: 30 },
      HIGH_ANNUAL: { amount: 199, planName: 'HIGH_ANNUAL', durationDays: 365 }
    };

    const { planId } = req.body || {};
    const planKey = (planId || 'HIGH').toUpperCase();
    const resolvedPlan = AUTHORITATIVE_PLANS[planKey] || AUTHORITATIVE_PLANS.HIGH;
    const now = new Date();
    const durationDays = resolvedPlan.durationDays;
    const expiryDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    if (targetUserId && supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        await supabase.from('user_profiles').upsert({
          id: targetUserId,
          subscription_plan: resolvedPlan.planName
        }, { onConflict: 'id' });

        await supabase.from('subscriptions').upsert({
          user_id: targetUserId,
          plan: resolvedPlan.planName,
          status: 'Active',
          purchase_date: now.toISOString(),
          expiry_date: expiryDate.toISOString(),
          granted_by: 'Razorpay Gateway',
          payment_source: 'Razorpay',
          payment_id: razorpay_payment_id,
          amount: resolvedPlan.amount,
          currency: 'INR',
          updated_at: now.toISOString()
        }, { onConflict: 'user_id' });

        await supabase.from('admin_audit_logs').insert({
          admin_id: 'Razorpay Gateway',
          action: 'PAYMENT_SUCCESS_HIGH_GRANTED',
          target_id: targetUserId,
          details: JSON.stringify({
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            plan: resolvedPlan.planName,
            amount: resolvedPlan.amount,
            expiry_date: expiryDate.toISOString()
          })
        });

      } catch (dbErr) {
        console.warn('Supabase DB subscription persist warning:', dbErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and subscription activated successfully',
      plan: resolvedPlan.planName,
      expiresAt: expiryDate.toISOString(),
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id
    });
  } catch (err) {
    console.error("Razorpay payment verification error:", err);
    return res.status(500).json({
      success: false,
      error: { message: err.message || 'Payment verification failed' }
    });
  }
}
