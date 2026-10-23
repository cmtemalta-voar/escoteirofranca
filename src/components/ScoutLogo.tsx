import React, { useState } from 'react';

export const ScoutLogo: React.FC<{ className?: string; alt?: string }> = ({ 
  className = 'w-14 h-14',
  alt = 'G.E.T. 22 de Fevereiro - Franca/SP'
}) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      {!hasError ? (
        <img
          src="/assets/aistudio/Logo_Escoteir_b56789c3.jpeg"
          alt={alt}
          className="w-full h-full object-contain rounded-full select-none"
          loading="eager"
          onError={() => setHasError(true)}
        />
      ) : (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" stroke="#1b4332" strokeWidth="2.5" fill="#fcfbf9" />
          <circle cx="50" cy="50" r="42" stroke="#1b4332" strokeWidth="1" strokeDasharray="2 2" fill="none" />
          <text x="50" y="46" textAnchor="middle" className="text-[7px] font-bold uppercase fill-emerald-950 font-sans">
            G.E.T. 22 DE FEVEREIRO
          </text>
          <text x="50" y="58" textAnchor="middle" className="text-[6.5px] font-bold uppercase fill-emerald-900 font-sans">
            FRANCA - SP
          </text>
        </svg>
      )}
    </div>
  );
};
