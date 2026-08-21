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

    const isMatch = generatedSignature === razorpay_signature;

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Verification failed.'
      });
    }

    // Persist Subscription to Supabase DB if userId is present
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (targetUserId && supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const now = new Date();
        const expiryDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

        await supabase.from('user_profiles').upsert({
          id: targetUserId,
          subscription_plan: 'HIGH'
        }, { onConflict: 'id' });

        await supabase.from('subscriptions').upsert({
          user_id: targetUserId,
          plan: 'HIGH',
          status: 'Active',
          purchase_date: now.toISOString(),
          expiry_date: expiryDate.toISOString(),
          granted_by: 'Razorpay Gateway',
          payment_source: 'Razorpay',
          payment_id: razorpay_payment_id,
          amount: 2,
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
            plan: 'HIGH',
            amount: 2,
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
