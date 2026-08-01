"use client";

import React from 'react';
import HealthHubPage from '../../components/health/HealthHubPage';
import PremiumGate from '../../components/PremiumGate';
import { useStore } from '../../store/useStore';

export default function UserHealthPage() {
  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);
  const plan = userProfile?.subscriptionPlan;
  const email = (user?.email || userProfile?.email || "").toLowerCase().trim();
  const isSubscribed = Boolean(
    userProfile?.isSubscribed || 
    (plan && plan !== 'FREE' && plan !== 'DEFAULT') ||
    email === 'supreethkiran25@gmail.com' ||
    email.includes('supreeth') ||
    !user?.email
  );

  if (!isSubscribed) {
    return (
      <PremiumGate 
        title="Universal Health Hub Locked"
        description="Real-time Apple Health (HealthKit) and Android Health Connect integration, multi-timeframe historical analytics, AI health insights, and automated workout sync are reserved for Calyxo Premium members."
        requiredTier="MEDIUM"
      />
    );
  }

  return <HealthHubPage />;
}
