import Razorpay from 'razorpay';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key_id = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return res.status(401).json({
      error: { message: 'Razorpay credentials not configured on server' }
    });
  }

  const { amount, currency = 'INR', receipt } = req.body || {};

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount < 100) {
    return res.status(400).json({
      error: { message: 'Invalid order amount. Minimum required amount is 100 paise (₹1.00).' }
    });
  }

  try {
    const razorpay = new Razorpay({
      key_id,
      key_secret
    });

    const orderOptions = {
      amount: Math.round(numAmount),
      currency: currency.toUpperCase(),
      receipt: receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };

    const order = await razorpay.orders.create(orderOptions);

    return res.status(200).json({
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    });
  } catch (err) {
    console.error("Razorpay order creation error:", err);
    return res.status(500).json({
      error: { message: err?.error?.description || err.message || 'Failed to create Razorpay order' }
    });
  }
}
