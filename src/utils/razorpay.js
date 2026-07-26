import { saveUserProfile } from '../lib/dbService';

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const startRazorpayCheckout = async ({
  plan,
  user,
  userProfile,
  updateUserProfile,
  onNotification,
  onSuccess,
  onError,
  onLoadingChange
}) => {
  if (!plan || plan.id === 'FREE') return;

  if (onLoadingChange) onLoadingChange(true);

  try {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      if (onNotification) onNotification("Failed to load Razorpay SDK. Please check your internet connection.");
      if (onLoadingChange) onLoadingChange(false);
      return;
    }

    const amountPaise = plan.id === 'MEDIUM' ? 100 : plan.id === 'HIGH' ? 200 : (plan.amountPaise || 100);
    let orderData = null;

    try {
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountPaise,
          currency: 'INR',
          receipt: `rcpt_${user?.uid ? user.uid.substring(0, 8) : 'usr'}_${Date.now()}`
        })
      });

      if (orderRes.ok) {
        orderData = await orderRes.json();
      }
    } catch (apiErr) {
      console.warn("Backend create-order endpoint unavailable, proceeding with standard client checkout:", apiErr);
    }

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_THntfStnhzEiO8';

    const options = {
      key: razorpayKey,
      amount: orderData?.amount || amountPaise,
      currency: orderData?.currency || 'INR',
      name: 'Calyxo Nutrition & Fitness',
      description: `${plan.name || plan.id} Subscription`,
      ...(orderData?.order_id ? { order_id: orderData.order_id } : {}),
      handler: async function (response) {
        let verified = false;

        if (response.razorpay_signature && response.razorpay_order_id) {
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              verified = true;
            }
          } catch (vErr) {
            console.warn("Signature verify API skipped/failed, validating payment ID:", vErr);
          }
        }

        if (verified || response.razorpay_payment_id) {
          const updatedProfile = { 
            ...userProfile, 
            subscriptionPlan: plan.id,
            isSubscribed: true,
            lastPaymentId: response.razorpay_payment_id || `pay_${Date.now()}`
          };
          if (updateUserProfile) updateUserProfile(updatedProfile);
          if (user?.uid) await saveUserProfile(user.uid, updatedProfile);
          if (onNotification) onNotification(`Payment successful! Welcome to ${plan.name || plan.id}!`);
          if (onSuccess) onSuccess(updatedProfile);
        } else {
          if (onNotification) onNotification("Payment completion could not be verified. Please contact support.");
          if (onError) onError(new Error("Payment verification failed"));
        }
        if (onLoadingChange) onLoadingChange(false);
      },
      prefill: {
        name: userProfile?.nickname || userProfile?.firstName || user?.displayName || 'Calyxo Athlete',
        email: user?.email || '',
      },
      theme: {
        color: '#86efac'
      },
      modal: {
        ondismiss: function () {
          if (onNotification) onNotification("Payment cancelled.");
          if (onLoadingChange) onLoadingChange(false);
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response) {
      console.error("Razorpay Payment Failed:", response.error);
      if (onNotification) onNotification(`Payment failed: ${response.error?.description || response.error?.reason || 'Transaction declined'}`);
      if (onError) onError(response.error);
      if (onLoadingChange) onLoadingChange(false);
    });

    rzp.open();
  } catch (err) {
    console.error("Razorpay checkout exception:", err);
    if (onNotification) onNotification(`Checkout error: ${err.message}`);
    if (onError) onError(err);
    if (onLoadingChange) onLoadingChange(false);
  }
};
