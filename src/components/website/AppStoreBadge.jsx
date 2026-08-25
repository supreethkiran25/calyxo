import React from 'react';

// General App Store URL
export const CALYXO_APP_STORE_URL = 'https://www.apple.com/app-store/';

export function AppleLogoIcon({ className = "w-6 h-6", fill = "currentColor" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 170 170" 
      fill={fill} 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.71-11.71-14.01-6.19-9.56-11.01-20.73-14.46-33.51-3.46-12.78-5.19-24.69-5.19-35.73 0-14.93 3.65-27.13 10.95-36.6 7.3-9.48 16.59-14.33 27.87-14.56 5.37 0 11.2 1.47 17.5 4.41 6.3 2.94 10.29 4.47 11.96 4.6 2.05-.26 6.31-1.89 12.78-4.91 6.47-3.01 12.23-4.38 17.29-4.11 12.63.76 22.74 5.38 30.34 13.85-11.01 6.69-16.38 15.86-16.11 27.52.27 9.07 3.86 16.71 10.77 22.92 6.91 6.21 14.99 9.77 24.23 10.68-2.22 6.53-4.8 12.92-7.75 19.16zm-38.35-104.9c0-6.73 2.45-13.06 7.35-18.99 4.9-5.93 11-9.74 18.3-11.44.75 2.15 1.13 4.41 1.13 6.77 0 6.62-2.58 13.05-7.74 19.29-5.16 6.24-11.23 9.94-18.2 11.1-.38-2.26-.84-4.5-.84-6.73z" />
    </svg>
  );
}

export default function AppStoreBadge({ 
  url = CALYXO_APP_STORE_URL, 
  variant = 'black',
  size = 'md',
  className = "",
  onClick = null
}) {
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const isWhite = variant === 'white';

  return (
    <button
      onClick={handleClick}
      aria-label="Download on the App Store"
      className={`inline-flex items-center gap-3.5 px-5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 select-none h-[48px] ${
        isWhite 
          ? 'bg-white hover:bg-gray-100 text-black border border-gray-200 shadow-xl' 
          : 'bg-[#000000] hover:bg-[#111114] text-white border border-[#333336] shadow-xl hover:border-[#66666a]'
      } ${className}`}
    >
      <div className="shrink-0 flex items-center justify-center">
        <AppleLogoIcon 
          className="w-6 h-6" 
          fill={isWhite ? '#000000' : '#FFFFFF'} 
        />
      </div>

      <div className="text-left font-sans flex flex-col justify-center">
        <span className={`text-[10px] tracking-tight font-normal leading-none mb-0.5 ${
          isWhite ? 'text-gray-700' : 'text-gray-300'
        }`}>
          Download on the
        </span>
        <span className={`text-[17px] font-bold tracking-tight font-outfit leading-none ${
          isWhite ? 'text-black' : 'text-white'
        }`}>
          App Store
        </span>
      </div>
    </button>
  );
}
