import React, { useEffect, useState } from 'react';
import { KausicSoundSystemLogo } from './KausicSoundSystemLogo';
import { Sparkles, Radio } from 'lucide-react';

interface BootScreenProps {
  onComplete: () => void;
}

export const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Ultra-smooth 1.0s boot sequence
    const t1 = setTimeout(() => setIsFading(true), 900);
    const t2 = setTimeout(() => onComplete(), 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      className={`fixed inset-0 z-[100000] bg-[#050505] flex flex-col items-center justify-center p-6 select-none transition-opacity duration-300 cursor-pointer overflow-hidden ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Dynamic Concentric Acoustic Soundwaves Expanding in Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full border border-amber-500/10 animate-ping duration-1000" />
        <div className="absolute w-72 h-72 rounded-full border border-amber-400/15 animate-pulse" />
        <div className="absolute w-52 h-52 rounded-full bg-gradient-to-r from-amber-500/15 via-yellow-400/10 to-transparent blur-2xl" />
      </div>

      {/* Main Glass Splash Core */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-400">
        {/* New 3D Acoustic Sound Core Logo with Golden Specular Flare */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 to-yellow-600 rounded-full blur-md opacity-40 group-hover:opacity-75 transition duration-500" />
          <KausicSoundSystemLogo size="xl" className="shadow-[0_25px_60px_rgba(0,0,0,0.95)]" />
        </div>

        {/* Brand Typography */}
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-widest text-white drop-shadow-[0_2px_20px_rgba(212,175,55,0.45)] font-sans">
            KAUSIC
          </h1>

          {/* Designed by Kaushik Golden Signature */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] backdrop-blur-2xl border border-amber-400/30 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="text-xs font-bold tracking-wider shimmer-gold">
              Designed by Kaushik
            </span>
          </div>
        </div>

        {/* Precision Acoustic Status Indicator */}
        <div className="pt-3 flex flex-col items-center gap-1.5 text-[11px] text-neutral-400">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300/90">
            <Radio className="w-3 h-3 animate-pulse" />
            <span className="font-mono font-medium tracking-wide">Crystal Sound Engine Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
