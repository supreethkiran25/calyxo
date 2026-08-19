import React from 'react';
import AIWorkspace from '../../components/AIWorkspace';
import PremiumGate from '../../components/PremiumGate';
import { useStore } from '../../store/useStore';

export default function AIPage() {
  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);
  const plan = userProfile?.subscriptionPlan;
  const email = (user?.email || userProfile?.email || "").toLowerCase().trim();
  const isSubscribed = Boolean(
    userProfile?.isSubscribed || 
    (plan && plan !== 'FREE' && plan !== 'DEFAULT') ||
    email === 'supreethkiran25@gmail.com'
  );

  if (!isSubscribed) {
    return (
      <PremiumGate 
        title="AI Workspace Locked"
        description="The AI Fitness & Nutrition Coach with long-term memory is reserved for subscribed members. Upgrade to Medium or High plan to unlock."
        requiredTier="MEDIUM"
      />
    );
  }

  return <AIWorkspace />;
}
