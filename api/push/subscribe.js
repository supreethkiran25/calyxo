import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase credentials not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  if (req.method === 'POST') {
    const { userId, subscription, platform = 'web', browser = 'browser' } = req.body || {};

    if (!userId || !subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'userId and subscription object are required' });
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
      return res.status(500).json({ error: err.message || 'Failed to save push subscription' });
    }
  }

  if (req.method === 'DELETE') {
    const { userId, endpoint } = req.body || {};

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    try {
      let query = supabase.from('push_subscriptions').delete().eq('user_id', userId);
      if (endpoint) query = query.eq('endpoint', endpoint);

      const { error } = await query;
      if (error) throw error;

      return res.status(200).json({ success: true, message: 'Push subscription removed' });
    } catch (err) {
      console.error('Delete push subscription error:', err);
      return res.status(500).json({ error: err.message || 'Failed to remove push subscription' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
