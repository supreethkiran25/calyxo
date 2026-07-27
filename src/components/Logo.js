import React from 'react';

export default function Logo({ className = "w-7 h-7", glow = false, color, showText = false, textClassName = "" }) {
  // If className doesn't specify a text color, default to text-foreground
  const hasTextColor = /\btext-/.test(className);
  const colorClass = hasTextColor ? '' : 'text-foreground';

  const iconElement = (
    <div 
      className={`${className} ${colorClass} transition-all duration-300 relative inline-block shrink-0`}
      style={{
        display: 'inline-block',
        position: 'relative',
        color: color || undefined
      }}
    >
      {/* Front Mask Element - Renders clean single bodybuilder silhouette */}
      <div 
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'currentColor', // Dynamically inherits text-foreground (white in dark mode, black in light mode)
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
            filter: 'blur(4px)',
            opacity: 0.3,
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  );

  if (showText) {
    return (
      <div className="flex items-center gap-2.5 shrink-0">
        {iconElement}
        <span className={`brand-name text-lg tracking-wider text-foreground ${textClassName}`}>CALYXO</span>
      </div>
    );
  }

  return iconElement;
}

export { Logo };
