import React from 'react';

export default function Logo({ className = "w-8 h-8", glow = true }) {
  return (
    <div 
      className={`${className} transition-all duration-300 relative inline-block`}
      style={{
        display: 'inline-block',
        position: 'relative'
      }}
    >
      {/* Front Mask Element - Renders the clean bodybuilder silhouette natively centered */}
      <div 
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'currentColor', // Dynamically inherits the theme accent or text color
          WebkitMaskImage: 'url(/calyxo-removebg-preview.png)',
          maskImage: 'url(/calyxo-removebg-preview.png)',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center'
        }}
      />
      {/* Optional Glow/Blur Shadow Element */}
      {glow && (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'currentColor',
            WebkitMaskImage: 'url(/calyxo-removebg-preview.png)',
            maskImage: 'url(/calyxo-removebg-preview.png)',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            filter: 'blur(6px)',
            opacity: 0.35,
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  );
}

export { Logo };
