import React from 'react';

export default function Logo({ className = "w-8 h-8", glow = true }) {
  return (
    <div 
      className={`${className} transition-all duration-300 relative inline-flex items-center justify-center overflow-hidden rounded-full border border-white/10`}
      style={{
        boxShadow: glow ? '0 0 15px rgba(255, 255, 255, 0.05)' : 'none'
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src="/calyxo1.jpg" 
        className="w-full h-full object-cover" 
        alt="Calyxo Bodybuilder Logo" 
      />
    </div>
  );
}

export { Logo };
