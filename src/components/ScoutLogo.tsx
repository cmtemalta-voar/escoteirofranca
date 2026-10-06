import React from 'react';

export const ScoutLogo: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer Circular Badge */}
        <circle cx="50" cy="50" r="46" stroke="#1b4332" strokeWidth="2.5" fill="#fcfbf9" />
        <circle cx="50" cy="50" r="42" stroke="#1b4332" strokeWidth="1" strokeDasharray="2 2" fill="none" />
        
        {/* Curved Text Path */}
        <path id="textPathTop" d="M 18,50 A 32,32 0 1,1 82,50" fill="none" />
        <text className="text-[7px] font-bold uppercase tracking-wider fill-emerald-950 font-sans">
          <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">
            G. E. T. 22 DE FEVEREIRO
          </textPath>
        </text>

        <path id="textPathBottom" d="M 82,50 A 32,32 0 0,1 18,50" fill="none" />
        <text className="text-[6.5px] font-bold uppercase tracking-widest fill-emerald-900 font-sans">
          <textPath href="#textPathBottom" startOffset="50%" textAnchor="middle">
            FRANCA - SP
          </textPath>
        </text>

        {/* Fleur-de-lis / Flor-de-lis Scout Symbol */}
        <g transform="translate(32, 28) scale(0.36)" fill="#2d6a4f" stroke="#1b4332" strokeWidth="1.5">
          {/* Central Petal */}
          <path d="M50 5 C50 5 60 25 60 45 C60 60 50 68 50 78 C50 68 40 60 40 45 C40 25 50 5 50 5 Z" fill="#2d6a4f" />
          <polygon points="50,15 48,22 52,22" fill="#d97706" />
          {/* Left Petal */}
          <path d="M45 45 C35 30 15 32 12 45 C10 55 22 62 38 56 C38 60 42 66 45 70 C40 68 35 68 32 72 C30 75 35 78 45 74 Z" fill="#2d6a4f" />
          {/* Right Petal */}
          <path d="M55 45 C65 30 85 32 88 45 C90 55 78 62 62 56 C62 60 58 66 55 70 C60 68 65 68 68 72 C70 75 65 78 55 74 Z" fill="#2d6a4f" />
          {/* Ring tie */}
          <rect x="36" y="62" width="28" height="6" rx="2" fill="#d97706" stroke="#92400e" strokeWidth="1" />
          {/* Lower Stem */}
          <path d="M50 74 C47 82 44 88 42 92 C48 90 52 90 58 92 C56 88 53 82 50 74 Z" fill="#2d6a4f" />
        </g>
      </svg>
    </div>
  );
};
