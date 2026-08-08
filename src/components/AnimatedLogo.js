import React from 'react';
import './AnimatedLogo.css';

const AnimatedLogo = ({ size = 'md', className = '' }) => {
  return (
    <div className={`codex-logo-container ${size} ${className}`}>
      <svg
        viewBox="0 0 120 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="codex-svg-wholesome"
      >
        {/* Wholesome AI Sprite Mascot (KIRO-inspired) */}
        <g className="mascot-wholesome">
          {/* Rounded, "Ghost-like" Robot Body */}
          <path
            d="M5 25 C5 10, 35 10, 35 25 L35 32 C35 35, 30 38, 20 38 C10 38, 5 35, 5 32 Z"
            fill="url(#grad-mascot-ide)"
            className="mascot-body"
          />

          {/* Large, Friendly Expressive Eyes */}
          <ellipse cx="14" cy="22" rx="2.5" ry="3.5" fill="#1A1F2E" className="mascot-eye" />
          <ellipse cx="26" cy="22" rx="2.5" ry="3.5" fill="#1A1F2E" className="mascot-eye" />

          {/* Subtle Blush for Wholesomeness */}
          <circle cx="10" cy="28" r="1.5" fill="#F472B6" opacity="0.4" />
          <circle cx="30" cy="28" r="1.5" fill="#F472B6" opacity="0.4" />
        </g>

        {/* "CodeX" Wordmark */}
        <g transform="translate(48, 0)">
          <text x="0" y="31" className="logo-text-wholesome" fill="#FFFFFF">
            code
            <tspan dx="3" className="logo-text-wholesome x-only" fill="#00D4FF">
              X
            </tspan>
          </text>
        </g>

        <defs>
          <linearGradient id="grad-mascot-ide" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          <filter id="soft-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default AnimatedLogo;
