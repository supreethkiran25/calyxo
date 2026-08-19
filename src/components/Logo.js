import React from 'react';

export default function Logo({ className = "w-8 h-8", glow = false, color, showText = false, textClassName = "" }) {
  // If className doesn't specify a text color, default to text-foreground
  const hasTextColor = /\btext-/.test(className);
  const colorClass = hasTextColor ? '' : 'text-foreground';

  const iconElement = (
    <div 
      className={`${className} ${colorClass} transition-all duration-300 relative inline-flex items-center justify-center shrink-0 p-[2%] overflow-visible`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        color: color || undefined
      }}
    >
      {/* Front Mask Element - Scaled to contain perfectly without clipping */}
      <div 
        className="w-full h-full"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'currentColor', // Dynamically inherits text-foreground or custom text color
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
          className="absolute inset-0 w-full h-full pointer-events-none"
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
            filter: 'blur(5px)',
            opacity: 0.5
          }}
        />
      )}
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


