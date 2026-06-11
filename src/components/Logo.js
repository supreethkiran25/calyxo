import React from 'react';

export default function Logo({ className = "w-8 h-8", glow = true }) {
  return (
    <svg 
      className={`${className} transition-all duration-300`} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="calyxo-gradient" cx="50%" cy="50%" r="60%" fx="30%" fy="30%">
          <stop offset="0%" stopColor="#d4ff6a" />
          <stop offset="100%" stopColor="#7dc832" />
        </radialGradient>
        {glow && (
          <filter id="green-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* Geometric C shape — bold, clean, modern */}
      <path 
        d="M78,18 L28,18 C21,18 16,23 16,30 L16,70 C16,77 21,82 28,82 L78,82 L85,74 L32,74 C27,74 24,71 24,67 L24,33 C24,29 27,26 32,26 L85,26 Z" 
        fill="url(#calyxo-gradient)"
        filter={glow ? "url(#green-glow)" : undefined}
      />
    </svg>
  );
}
export { Logo };
