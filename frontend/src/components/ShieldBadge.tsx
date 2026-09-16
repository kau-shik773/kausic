import React, { useState } from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const ShieldBadge: React.FC = () => {
  const { adblockStats } = usePlayer();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowTooltip(prev => !prev)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40 hover:border-emerald-500/50 transition-all text-xs font-medium backdrop-blur-md shadow-sm"
      >
        <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
        <span className="hidden sm:inline">Ad-Free Engine Active</span>
        <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-md font-mono text-[10px]">
          {adblockStats.bypassed_interstitials} Ads Bypassed
        </span>
      </button>

      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-72 p-4 rounded-xl bg-neutral-900/95 border border-neutral-700/80 shadow-2xl backdrop-blur-xl z-50 text-neutral-200">
          <div className="flex items-center gap-2 pb-2 mb-3 border-b border-neutral-800">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-xs text-white uppercase tracking-wider">
              Rust Stream Engine Telemetry
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-neutral-400">Interstitials Bypassed:</span>
              <span className="font-mono text-emerald-400 font-bold">{adblockStats.bypassed_interstitials}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-neutral-400">Tracker Requests Blocked:</span>
              <span className="font-mono text-emerald-400 font-bold">{adblockStats.blocked_ad_requests}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-neutral-400">Cue-Points Sanitized:</span>
              <span className="font-mono text-emerald-400 font-bold">{adblockStats.sanitized_cue_points}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-neutral-800 pt-2">
              <span className="text-neutral-400">Data Saved:</span>
              <span className="font-mono text-emerald-400 font-bold">{adblockStats.saved_bandwidth_mb} MB</span>
            </div>
          </div>
          <p className="mt-3 text-[10px] text-neutral-500 leading-tight">
            Protected via InnerTube filter heuristics & direct clean Opus/AAC stream extraction.
          </p>
        </div>
      )}
    </div>
  );
};
