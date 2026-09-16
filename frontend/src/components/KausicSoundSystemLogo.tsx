import React from 'react';

interface KausicSoundSystemLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const KausicSoundSystemLogo: React.FC<KausicSoundSystemLogoProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${sizeMap[size]} ${className}`}>
      {/* Ambient Radial Acoustic Gold Halo */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400/25 via-yellow-300/20 to-amber-600/15 blur-lg pointer-events-none" />

      {/* 3D Circular Floating Sound Orb Container */}
      <div className="relative w-full h-full rounded-full bg-gradient-to-b from-[#1e1c15] via-[#101014] to-[#050508] border border-amber-400/40 shadow-[0_10px_30px_rgba(0,0,0,0.85),inset_0_1.5px_2px_rgba(255,240,180,0.4)] flex items-center justify-center overflow-hidden">
        {/* Optical Specular Glare Reflection */}
        <div className="absolute -top-[60%] -left-[60%] w-[150%] h-[150%] bg-gradient-to-br from-white/25 via-amber-200/5 to-transparent rotate-45 pointer-events-none" />

        {/* 3D Acoustic Vector Core */}
        <svg
          viewBox="0 0 100 100"
          className="w-[88%] h-[88%] drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
        >
          <defs>
            {/* Primary Polished Champagne Gold Gradient */}
            <linearGradient id="coreGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff7d6" />
              <stop offset="25%" stopColor="#e5be53" />
              <stop offset="50%" stopColor="#b88d22" />
              <stop offset="75%" stopColor="#fdf0be" />
              <stop offset="100%" stopColor="#7a5704" />
            </linearGradient>

            {/* Dark Acoustic Resonance Chamber Radial */}
            <radialGradient id="chamberAcoustic" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#08080b" />
              <stop offset="60%" stopColor="#121217" />
              <stop offset="85%" stopColor="#1f1e1b" />
              <stop offset="100%" stopColor="#d4af37" />
            </radialGradient>

            {/* 3D Convex Metallic Core Sphere Gradient */}
            <radialGradient id="sphereCore" cx="35%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="20%" stopColor="#fff0bc" />
              <stop offset="55%" stopColor="#d4af37" />
              <stop offset="85%" stopColor="#7c5a08" />
              <stop offset="100%" stopColor="#3d2a00" />
            </radialGradient>

            {/* Radial Acoustic Dispersion Blade Gradient */}
            <linearGradient id="bladeGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f7e199" />
              <stop offset="100%" stopColor="#916c0b" />
            </linearGradient>
          </defs>

          {/* Outer Beveled Chassis Ring */}
          <circle cx="50" cy="50" r="46" fill="none" stroke="url(#coreGold)" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="43.5" fill="none" stroke="#2a271f" strokeWidth="1" />

          {/* Inner Acoustic Diaphragm Basin */}
          <circle cx="50" cy="50" r="41" fill="url(#chamberAcoustic)" />

          {/* Precision CNC Dispersion Ports (8 radial acoustic vents) */}
          <g stroke="url(#bladeGold)" strokeWidth="1.2" opacity="0.75">
            <line x1="50" y1="12" x2="50" y2="20" strokeLinecap="round" />
            <line x1="50" y1="80" x2="50" y2="88" strokeLinecap="round" />
            <line x1="12" y1="50" x2="20" y2="50" strokeLinecap="round" />
            <line x1="80" y1="50" x2="88" y2="50" strokeLinecap="round" />
            <line x1="23" y1="23" x2="29" y2="29" strokeLinecap="round" />
            <line x1="71" y1="71" x2="77" y2="77" strokeLinecap="round" />
            <line x1="77" y1="23" x2="71" y2="29" strokeLinecap="round" />
            <line x1="29" y1="71" x2="23" y2="77" strokeLinecap="round" />
          </g>

          {/* Concentric Acoustic Wave Grooves */}
          <circle cx="50" cy="50" r="33" fill="none" stroke="url(#coreGold)" strokeWidth="1.2" opacity="0.6" strokeDasharray="5,2.5" />
          <circle cx="50" cy="50" r="26" fill="none" stroke="#fff4cc" strokeWidth="0.8" opacity="0.5" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="url(#coreGold)" strokeWidth="1" opacity="0.7" />

          {/* 3D Convex Spherical Acoustic Core */}
          <circle cx="50" cy="50" r="14.5" fill="url(#sphereCore)" stroke="#fff8dc" strokeWidth="1" />

          {/* Primary High-Gloss Glint Reflection */}
          <ellipse cx="46" cy="45" rx="5" ry="3" fill="#ffffff" opacity="0.85" transform="rotate(-30 46 45)" />

          {/* Micro Ambient Facets */}
          <circle cx="50" cy="50" r="4" fill="none" stroke="#ffffff" strokeWidth="0.6" opacity="0.4" />
        </svg>
      </div>
    </div>
  );
};
