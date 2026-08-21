import React from 'react';
import HealthHubPage from '../../components/health/HealthHubPage';

// Premium gating is handled inside HealthHubPage itself — no duplicate check needed here.
export default function UserHealthPage() {
  return <HealthHubPage />;
}
