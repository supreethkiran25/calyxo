import { createClient } from '@supabase/supabase-js';
import { setCorsHeaders, verifyAuthUser } from '../lib/auth.js';

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  const authUser = await verifyAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized. Valid bearer token required to manage push subscriptions.' });
  }

  const userId = authUser.id;

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase credentials not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  if (req.method === 'POST') {
    const { subscription, platform = 'web', browser = 'browser' } = req.body || {};

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'subscription object with valid endpoint is required' });
    }

    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          subscription,
          endpoint: subscription.endpoint,
          platform,
          browser,
          updated_at: new Date().toISOString(),
          last_used_at: new Date().toISOString()
        }, { onConflict: 'endpoint' })
        .select();

      if (error) throw error;

      return res.status(200).json({ success: true, subscription: data?.[0] });
    } catch (err) {
      console.error('Save push subscription error:', err);
      return res.status(500).json({ error: 'Failed to save push subscription' });
    }
  }

  if (req.method === 'DELETE') {
    const { endpoint } = req.body || {};

    try {
      let query = supabase.from('push_subscriptions').delete().eq('user_id', userId);
      if (endpoint) query = query.eq('endpoint', endpoint);

      const { error } = await query;
      if (error) throw error;

      return res.status(200).json({ success: true, message: 'Push subscription removed' });
    } catch (err) {
      console.error('Delete push subscription error:', err);
      return res.status(500).json({ error: 'Failed to remove push subscription' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
