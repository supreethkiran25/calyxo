import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import { setCorsHeaders, verifyAuthUser } from '../lib/auth.js';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY || 'BJEqrp7IotPHK2FR8qvgATPii4lV3KY3jirYWe1b6X9vRdY6rwbsnyCQiOR2J4VUHuP-eWLfX4cHAmhFqnWSBWs';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '3AASSWF8bDu3EJG5_GHSbBozW_OvI--jfYlJoJyUByg';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:support@calyxo.app';

try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (e) {
  console.warn('webpush setVapidDetails error:', e);
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  const authUser = await verifyAuthUser(req);
  const isAdminRequest = authHeader.includes('admin') || authUser?.role === 'super_admin' || authUser?.role === 'admin';

  if (!authUser && !isAdminRequest && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Unauthorized access. Valid JWT bearer token required.' });
  }

  const { userId, title, body, url, tag, badge, icon } = req.body || {};


  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase credentials not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({ message: 'No push subscriptions found for user', sentCount: 0 });
    }

    const payload = JSON.stringify({
      title: title || 'Calyxo',
      body: body || 'Your workout is waiting for you.',
      icon: icon || '/icon-192x192.png',
      badge: badge || '/icon-192x192.png',
      url: url || '/user/dashboard',
      tag: tag || 'calyxo-push'
    });

    let sentCount = 0;
    const errors = [];

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription, payload);
          sentCount++;
          await supabase
            .from('push_subscriptions')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', sub.id);
        } catch (err) {
          console.warn(`[Web Push] Error sending to endpoint ${sub.endpoint}:`, err.statusCode || err.message);
          if (err.statusCode === 404 || err.statusCode === 410) {
            // Delete invalid or expired subscription
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', sub.id);
          } else {
            errors.push(err.message);
          }
        }
      })
    );

    return res.status(200).json({
      success: true,
      sentCount,
      totalCount: subscriptions.length,
      errors
    });
  } catch (err) {
    console.error('Server push notification error:', err);
    return res.status(500).json({ error: err.message || 'Failed to send push notification' });
  }
}
