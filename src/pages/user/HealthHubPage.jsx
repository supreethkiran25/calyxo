import React from 'react';
import HealthHub from '../../components/HealthHub';
import PremiumGate from '../../components/PremiumGate';
import { useStore } from '../../store/useStore';

export default function HealthHubPage() {
  const userProfile = useStore(state => state.userProfile);
  const plan = userProfile?.subscriptionPlan;
  const isHighOrMedium = Boolean(
    userProfile?.isSubscribed || 
    (plan && plan !== 'FREE' && plan !== 'DEFAULT')
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
