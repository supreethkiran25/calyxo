import crypto from 'crypto';

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

  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_secret) {
    return res.status(500).json({
      error: { message: 'RAZORPAY_KEY_SECRET is not configured on server' }
    });
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body || {};

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

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
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
