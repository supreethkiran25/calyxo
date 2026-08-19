import React from 'react';
import AICoach from './AICoach';

export default function AIWorkspace({ onNotification }) {
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-1 overflow-hidden relative">
        <AICoach onNotification={onNotification} />
      </div>
    </div>
  );
}
