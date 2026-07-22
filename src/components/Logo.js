import React from 'react';

export default function Logo({ className = "w-8 h-8", glow = true, color }) {
  // If className doesn't specify a text color, default to text-acid-green / #ccff00
  const hasTextColor = /\btext-/.test(className);
  const colorClass = hasTextColor ? '' : 'text-[var(--color-acid-green,#ccff00)]';

  return (
    <div 
      className={`${className} ${colorClass} transition-all duration-300 relative inline-block shrink-0`}
      style={{
        display: 'inline-block',
        position: 'relative',
        color: color || undefined
      }}
    >
      {/* Front Mask Element - Renders the clean bodybuilder silhouette */}
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
            inset: -4,
            backgroundColor: 'currentColor',
            WebkitMaskImage: 'url(/calyxo-removebg-preview.png)',
            maskImage: 'url(/calyxo-removebg-preview.png)',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            filter: 'blur(10px)',
            opacity: 0.65,
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  );
}

export { Logo };
