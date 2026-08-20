import React from 'react';

export default function Logo({ className = "w-8 h-8", glow = false, color, showText = false, textClassName = "" }) {
  // If className doesn't specify a text color, default to text-foreground
  const hasTextColor = /\btext-/.test(className);
  const colorClass = hasTextColor ? '' : 'text-foreground';

  const iconElement = (
    <div 
      className={`${className} ${colorClass} transition-all duration-300 relative inline-flex items-center justify-center shrink-0 overflow-hidden`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        color: color || undefined
      }}
    >
      {/* Crisp, sharp single-layer mask */}
      <div 
        className="w-full h-full"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'currentColor',
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
    </div>
  );

  if (showText) {
    return (
      <div className="inline-flex items-center gap-2.5 shrink-0 leading-none">
        {iconElement}
        <span className={`brand-name text-lg tracking-wider text-foreground select-none ${textClassName}`}>CALYXO</span>
      </div>
    );
  }

  return iconElement;
}

export { Logo };



