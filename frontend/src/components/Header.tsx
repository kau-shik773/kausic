import React from 'react';
import { Sliders, ShieldCheck } from 'lucide-react';
import { KaushikBadge } from './KaushikBadge';
import { KausicSoundSystemLogo } from './KausicSoundSystemLogo';
import { usePlayer } from '../context/PlayerContext';

export const Header: React.FC = () => {
  const { setEqualizerOpen } = usePlayer();

  return (
    <header className="h-14 sm:h-16 border-b border-[#d4af37]/20 bg-[#07070a]/80 backdrop-blur-2xl px-3 sm:px-6 flex items-center justify-between gap-2 shrink-0 z-20 select-none">
      {/* Left: 3D Music System Logo & Brand */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <KausicSoundSystemLogo size="sm" />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black tracking-widest bg-gradient-to-r from-[#ffffff] via-[#f7e7b4] to-[#d4af37] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(212,175,55,0.3)] font-sans">
              KAUSIC
            </h1>
            <span className="hidden sm:inline-block text-[9px] px-2 py-0.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#f7e7b4] font-semibold tracking-wider">
              2050 EDITION
            </span>
          </div>
          <span className="text-[9px] text-[#e5c07b]/70 font-mono tracking-wider">
            CRYSTAL SOUND SYSTEM
          </span>
        </div>
      </div>

      {/* Right: Kaushik Badge, Zero Ads & Hardware EQ */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Hardware EQ Trigger */}
        <button
          onClick={() => setEqualizerOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill-gold hover:bg-white/[0.12] text-[#f7e7b4] text-xs font-medium transition-all active:scale-95 border border-[#d4af37]/30"
          title="Open Hardware Equalizer & Volume Overdrive"
        >
          <Sliders className="w-3.5 h-3.5 text-[#d4af37]" />
          <span className="hidden sm:inline text-[11px] font-semibold">EQ // DSP</span>
        </button>

        {/* Designed by Kaushik Easter Egg Badge */}
        <KaushikBadge variant="header" />

        {/* Ad-Free Status */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/[0.10] border border-emerald-500/30 text-emerald-400 text-[10px] font-bold backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>ZERO ADS</span>
        </div>
      </div>
    </header>
  );
};
