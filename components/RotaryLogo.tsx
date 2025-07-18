import React from 'react';

interface RotaryLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function RotaryLogo({ className = '', size = 'md' }: RotaryLogoProps) {
  const sizeClasses = {
    sm: 'h-12',
    md: 'h-16',
    lg: 'h-20',
    xl: 'h-24'
  };

  const textSizes = {
    sm: { primary: 'text-lg', secondary: 'text-xs', location: 'text-sm' },
    md: { primary: 'text-xl', secondary: 'text-sm', location: 'text-base' },
    lg: { primary: 'text-2xl', secondary: 'text-base', location: 'text-lg' },
    xl: { primary: 'text-3xl', secondary: 'text-lg', location: 'text-xl' }
  };

  const wheelSizes = {
    sm: 32,
    md: 42,
    lg: 52,
    xl: 62
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Text Section */}
      <div className="flex flex-col">
        <div className={`${textSizes[size].primary} font-semibold text-[#0052CC] leading-tight`}>
          Rotary
        </div>
        <div className={`${textSizes[size].secondary} text-gray-600 leading-tight`}>
          Club of
        </div>
        <div className={`${textSizes[size].location} text-gray-800 font-medium leading-tight`}>
          Nairobi Gigiri
        </div>
      </div>

      {/* Rotary Wheel Symbol */}
      <div className="flex-shrink-0">
        <svg 
          width={wheelSizes[size]} 
          height={wheelSizes[size]} 
          viewBox="0 0 100 100" 
          className="drop-shadow-sm"
        >
          {/* Outer Ring */}
          <circle 
            cx="50" 
            cy="50" 
            r="48" 
            fill="#F7A800" 
            stroke="#E89900" 
            strokeWidth="2"
          />
          
          {/* Inner Ring */}
          <circle 
            cx="50" 
            cy="50" 
            r="38" 
            fill="none" 
            stroke="#E89900" 
            strokeWidth="2"
          />
          
          {/* Center Hub */}
          <circle 
            cx="50" 
            cy="50" 
            r="8" 
            fill="#E89900"
          />
          
          {/* Spokes - 24 spokes total */}
          {Array.from({ length: 24 }, (_, i) => {
            const angle = (i * 15) * (Math.PI / 180);
            const innerRadius = 8;
            const outerRadius = 38;
            const x1 = 50 + innerRadius * Math.cos(angle);
            const y1 = 50 + innerRadius * Math.sin(angle);
            const x2 = 50 + outerRadius * Math.cos(angle);
            const y2 = 50 + outerRadius * Math.sin(angle);
            
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#E89900"
                strokeWidth="1.5"
              />
            );
          })}
          
          {/* Gear Teeth around outer edge */}
          {Array.from({ length: 24 }, (_, i) => {
            const angle = (i * 15) * (Math.PI / 180);
            const innerRadius = 42;
            const outerRadius = 47;
            const toothWidth = 3;
            
            const x1 = 50 + innerRadius * Math.cos(angle - toothWidth * Math.PI / 180);
            const y1 = 50 + innerRadius * Math.sin(angle - toothWidth * Math.PI / 180);
            const x2 = 50 + outerRadius * Math.cos(angle - toothWidth * Math.PI / 180);
            const y2 = 50 + outerRadius * Math.sin(angle - toothWidth * Math.PI / 180);
            const x3 = 50 + outerRadius * Math.cos(angle + toothWidth * Math.PI / 180);
            const y3 = 50 + outerRadius * Math.sin(angle + toothWidth * Math.PI / 180);
            const x4 = 50 + innerRadius * Math.cos(angle + toothWidth * Math.PI / 180);
            const y4 = 50 + innerRadius * Math.sin(angle + toothWidth * Math.PI / 180);
            
            return (
              <polygon
                key={i}
                points={`${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`}
                fill="#F7A800"
                stroke="#E89900"
                strokeWidth="0.5"
              />
            );
          })}
          
          {/* Keyway */}
          <rect
            x="47"
            y="2"
            width="6"
            height="8"
            fill="#E89900"
            rx="1"
          />
        </svg>
      </div>
    </div>
  );
}

// Alternative simplified version for small spaces
export function RotaryLogoCompact({ className = '', size = 'sm' }: RotaryLogoProps) {
  const wheelSizes = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 48
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <svg 
        width={wheelSizes[size]} 
        height={wheelSizes[size]} 
        viewBox="0 0 100 100"
      >
        <circle cx="50" cy="50" r="48" fill="#F7A800" stroke="#E89900" strokeWidth="2"/>
        <circle cx="50" cy="50" r="38" fill="none" stroke="#E89900" strokeWidth="2"/>
        <circle cx="50" cy="50" r="8" fill="#E89900"/>
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30) * (Math.PI / 180);
          const x1 = 50 + 8 * Math.cos(angle);
          const y1 = 50 + 8 * Math.sin(angle);
          const x2 = 50 + 38 * Math.cos(angle);
          const y2 = 50 + 38 * Math.sin(angle);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#E89900" strokeWidth="2"/>
          );
        })}
      </svg>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-[#0052CC] leading-tight">Rotary</span>
        <span className="text-xs text-gray-600 leading-tight">Nairobi Gigiri</span>
      </div>
    </div>
  );
}