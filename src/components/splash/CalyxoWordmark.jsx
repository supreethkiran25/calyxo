import React from 'react';

/**
 * Precision CALYXO Geometric Wordmark
 *
 * Faithfully reproduces the geometric uppercase brand typography
 * featuring the distinctive Calyxo "A" with inner apex dot.
 * Color: #F5F5F5 | Weight: Medium / semi-light
 */
export default function CalyxoWordmark({ className = 'w-[280px] max-w-[80vw]' }) {
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <span className="sr-only">CALYXO</span>
      <svg
        viewBox="0 0 310 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto overflow-visible"
        aria-hidden="true"
      >
        {/* C */}
        <path
          d="M 33 10.5 A 13 13 0 1 0 33 26"
          stroke="#F5F5F5"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* A (Distinctive Calyxo chevron with centered inner dot) */}
        <path
          d="M 68 31.5 L 79 5.5 L 90 31.5"
          stroke="#F5F5F5"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="79" cy="22.5" r="2.1" fill="#F5F5F5" />

        {/* L */}
        <path
          d="M 125 5.5 L 125 31.5 L 139 31.5"
          stroke="#F5F5F5"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Y */}
        <path
          d="M 173 5.5 L 183 19.5 L 193 5.5 M 183 19.5 L 183 31.5"
          stroke="#F5F5F5"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X */}
        <path
          d="M 227 5.5 L 245 31.5 M 245 5.5 L 227 31.5"
          stroke="#F5F5F5"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* O */}
        <circle
          cx="287"
          cy="18.5"
          r="13"
          stroke="#F5F5F5"
          strokeWidth="2.2"
        />
      </svg>
    </div>
  );
}

export { CalyxoWordmark };
