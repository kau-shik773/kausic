import React from 'react';

interface GlassLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const GlassLogo: React.FC<GlassLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-20 h-20'
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
      {/* Soft Ambient Refraction Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-sky-400/10 to-indigo-500/20 blur-md" />

      {/* Crystal Glass Vessel */}
      <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-white/[0.16] to-white/[0.03] backdrop-blur-xl border border-white/25 shadow-[0_8px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] flex items-center justify-center overflow-hidden">
        {/* Optical Glass Specular Highlight */}
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/30 to-transparent rotate-45 pointer-events-none" />

        {/* Minimalist Sound Wave / Prism Glyph */}
        <svg
          viewBox="0 0 24 24"
          className="w-1/2 h-1/2 text-white fill-none stroke-current drop-shadow-[0_2px_8px_rgba(255,255,255,0.5)]"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12v1" />
          <path d="M8 8v9" />
          <path d="M12 4v16" />
          <path d="M16 7v11" />
          <path d="M20 10v4" />
        </svg>
      </div>
    </div>
  );
};
