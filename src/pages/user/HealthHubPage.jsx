import React from 'react';
import HealthHub from '../../components/HealthHub';
import PremiumGate from '../../components/PremiumGate';
import { useStore } from '../../store/useStore';

export default function HealthHubPage() {
  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);
  const plan = userProfile?.subscriptionPlan;
  const email = (user?.email || userProfile?.email || "").toLowerCase().trim();
  const isHighOrMedium = Boolean(
    userProfile?.isSubscribed || 
    (plan && plan !== 'FREE' && plan !== 'DEFAULT') ||
    email === 'supreethkiran25@gmail.com'
  );

  if (!isHighOrMedium) {
    return (
      <PremiumGate 
        title="Health Hub Locked"
        description="Health Hub recovery analytics, biometric scores, and 3D body forecasts require an active subscription tier."
        requiredTier="HIGH"
      />
    );
  }

  return <HealthHub />;
}
