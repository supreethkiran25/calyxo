import React from 'react';
import { Capacitor } from '@capacitor/core';
import CinematicExperience from './website/CinematicExperience';
import AppHeroLanding from './AppHeroLanding';

export default function LandingPage() {
  // If running inside the native mobile application (iOS / Android / Capacitor),
  // preserve 100% of the original App Hero Section with Get Started, Watch Demo, 3D Health Core, & BorderGlow cards
  if (Capacitor.isNativePlatform()) {
    return <AppHeroLanding />;
  }

  // On Web / Production URL, render the marketing website
  return <CinematicExperience />;
}
