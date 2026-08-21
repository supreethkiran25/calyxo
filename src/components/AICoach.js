
import React from 'react';
import AIIntelligenceHub from './ai/AIIntelligenceHub.jsx';

/**
 * Modern AI Coach Experience
 * Proxy wrapper to ensure unified UI/UX across all legacy and direct invocation paths.
 */
export default function AICoach({ onNotification, autoFocus = false, isModal = false, onClose = null }) {
  return (
    <div className="w-full h-full min-h-[500px] flex flex-col">
      <AIIntelligenceHub 
        onNotification={onNotification} 
        isModal={isModal} 
        onClose={onClose} 
      />
    </div>
  );
}
