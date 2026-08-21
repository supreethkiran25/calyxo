import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

  if (!webhookSecret) {
    return res.status(500).json({ error: 'Razorpay webhook secret not configured' });
  }

  const signature = req.headers['x-razorpay-signature'];
  if (!signature) {
    return res.status(400).json({ error: 'Missing X-Razorpay-Signature header' });
  }

  try {
    const shasum = crypto.createHmac('sha256', webhookSecret);
    const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    shasum.update(bodyStr);
    const digest = shasum.digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(digest, 'hex'), Buffer.from(signature, 'hex'))) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const eventType = event?.event;
    const payload = event?.payload?.payment?.entity || event?.payload?.subscription?.entity || {};

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const userEmail = payload.email || payload.notes?.email;
      const paymentId = payload.id;

      if (userEmail && (eventType === 'payment.captured' || eventType === 'order.paid' || eventType === 'subscription.charged')) {
        // Find matching profile by email
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('email', userEmail.toLowerCase().trim())
          .maybeSingle();

        if (profile?.id) {
          const now = new Date();
          const expiryDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

          await supabase.from('user_profiles').upsert({
            id: profile.id,
            subscription_plan: 'HIGH',
            updated_at: now.toISOString()
          }, { onConflict: 'id' });

          await supabase.from('subscriptions').upsert({
            user_id: profile.id,
            plan: 'HIGH',
            status: 'Active',
            purchase_date: now.toISOString(),
            expiry_date: expiryDate.toISOString(),
            granted_by: 'Razorpay Webhook',
            payment_source: 'Razorpay',
            payment_id: paymentId || `pay_wh_${Date.now()}`,
            amount: (payload.amount ? payload.amount / 100 : 2),
            currency: 'INR',
            updated_at: now.toISOString()
          }, { onConflict: 'user_id' });

          await supabase.from('admin_audit_logs').insert({
            admin_id: 'Razorpay Webhook Engine',
            action: 'WEBHOOK_PAYMENT_CAPTURED',
            target_id: profile.id,
            details: JSON.stringify({
              event: eventType,
              payment_id: paymentId,
              email: userEmail,
              amount: payload.amount ? payload.amount / 100 : 2
            })
          });
        }
      }
    }

    return res.status(200).json({ status: 'ok', event: eventType });
  } catch (err) {
    console.error('Razorpay webhook processing exception:', err);
    return res.status(500).json({ error: err.message || 'Webhook processing failed' });
  }
}
