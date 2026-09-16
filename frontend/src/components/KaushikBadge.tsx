import React, { useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioEngine } from '../services/audioEngine';

const EASTER_EGG_PHRASES = [
  "✨ CRYSTAL GOLD ACOUSTICS ENGINE ACTIVE",
  "🛡️ ZERO ADS. ZERO TELEMETRY. PURE KAUSIC.",
  "👑 HANDCRAFTED WITH PASSION BY KAUSHIK",
  "🎧 HARDWARE BIQUAD DSP RUNNING AT 60 FPS",
  "💎 APPLE LIQUID GLASS EDITION FOR ANDROID"
];

export const KaushikBadge: React.FC<{ variant?: 'header' | 'footer' | 'modal' }> = ({ variant = 'header' }) => {
  const [activePhrase, setActivePhrase] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playRoboticTick();

    // Trigger subtle luxury gold confetti blast
    confetti({
      particleCount: 25,
      spread: 55,
      origin: {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      },
      colors: ['#d4af37', '#f7e7b4', '#ffffff', '#e5c07b', '#ffd700']
    });

    const phrase = EASTER_EGG_PHRASES[Math.floor(Math.random() * EASTER_EGG_PHRASES.length)];
    setActivePhrase(phrase);
    setIsAnimating(true);

    setTimeout(() => {
      setIsAnimating(false);
    }, 2800);
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={handleClick}
        className={`group relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-300 select-none glass-pill-gold ${
          variant === 'header'
            ? 'text-xs hover:bg-white/[0.12]'
            : 'text-[11px] hover:bg-white/[0.08]'
        } ${isAnimating ? 'scale-105 ring-1 ring-[#d4af37]/60 shadow-[0_0_20px_rgba(212,175,55,0.4)]' : ''}`}
        title="Designed by Kaushik"
      >
        <Sparkles className="w-3 h-3 text-[#d4af37] transition-transform duration-300 group-hover:rotate-12" />
        <span className="font-medium tracking-tight text-neutral-300 text-[11px]">
          Designed by <span className="font-bold text-[#f7e7b4] shimmer-gold">Kaushik</span>
        </span>
      </button>

      {/* Floating Glass Toast */}
      {isAnimating && activePhrase && (
        <div className="absolute top-full mt-2 right-0 whitespace-nowrap px-4 py-2 rounded-2xl glass-panel-gold border border-[#d4af37]/40 text-[#f7e7b4] text-xs shadow-[0_10px_30px_rgba(0,0,0,0.85)] z-50 animate-in fade-in zoom-in-95 duration-200 flex items-center gap-2">
          <Heart className="w-3.5 h-3.5 text-[#d4af37] fill-[#d4af37]" />
          <span className="font-semibold">{activePhrase}</span>
        </div>
      )}
    </div>
  );
};
