import React, { useState } from 'react';
import { X, Sliders, ShieldCheck, Zap } from 'lucide-react';
import { audioEngine, EQ_PRESETS, type EQPresetName, type EQBandValues } from '../services/audioEngine';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({ isOpen, onClose }) => {
  const [activePreset, setActivePreset] = useState<EQPresetName>('bass_overdrive');
  const [bands, setBands] = useState<EQBandValues>(EQ_PRESETS.bass_overdrive.values);
  const [volumeBoost, setVolumeBoostState] = useState<number>(1.0); // 1.0 = 100%, 2.0 = 200%

  if (!isOpen) return null;

  const handlePresetSelect = (presetKey: EQPresetName) => {
    audioEngine.playRoboticTick();
    setActivePreset(presetKey);
    const newValues = EQ_PRESETS[presetKey].values;
    setBands(newValues);
    audioEngine.setEQ(newValues);
  };

  const handleBandChange = (key: keyof EQBandValues, value: number) => {
    const updated = { ...bands, [key]: value };
    setBands(updated);
    audioEngine.setEQ(updated);
  };

  const handleBoostChange = (val: number) => {
    setVolumeBoostState(val);
    audioEngine.setVolumeBoost(val);
  };

  const bandConfigs: Array<{ key: keyof EQBandValues; label: string; freq: string }> = [
    { key: 'band60', label: 'BASS', freq: '60 Hz' },
    { key: 'band250', label: 'LOW-MID', freq: '250 Hz' },
    { key: 'band1k', label: 'VOCALS', freq: '1.0 kHz' },
    { key: 'band4k', label: 'MID-HI', freq: '4.0 kHz' },
    { key: 'band12k', label: 'TREBLE', freq: '12.0 kHz' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="glass-panel-gold border border-[#d4af37]/35 rounded-3xl w-full max-w-xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative overflow-hidden">
        {/* Optical Specular Glare */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#d4af37]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#d4af37]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl glass-pill-gold flex items-center justify-center text-[#d4af37] border border-[#d4af37]/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Hardware Equalizer
                </h3>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#f7e7b4] font-semibold">
                  Biquad DSP
                </span>
              </div>
              <p className="text-xs text-neutral-400">5-Band Studio Grade Acoustic Tuning</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Selector Chips */}
        <div className="py-4">
          <label className="text-[11px] font-semibold text-[#f7e7b4] uppercase tracking-wider block mb-2.5">
            Acoustic Presets
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(Object.keys(EQ_PRESETS) as EQPresetName[]).map(key => (
              <button
                key={key}
                onClick={() => handlePresetSelect(key)}
                className={`px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activePreset === key
                    ? 'bg-gradient-to-r from-[#d4af37] via-[#f7e7b4] to-[#c59e2a] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105 font-bold'
                    : 'glass-pill-gold hover:bg-white/[0.12] text-neutral-300'
                }`}
              >
                {EQ_PRESETS[key].name}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-neutral-400 italic mt-2">
            {EQ_PRESETS[activePreset].description}
          </p>
        </div>

        {/* 5-Band Vertical Sliders */}
        <div className="my-4 bg-white/[0.03] border border-[#d4af37]/20 rounded-2xl p-5">
          <div className="grid grid-cols-5 gap-3 h-44 items-center justify-items-center">
            {bandConfigs.map(cfg => {
              const val = bands[cfg.key];
              return (
                <div key={cfg.key} className="flex flex-col items-center h-full justify-between w-full">
                  <span className="text-xs font-mono font-bold text-[#f7e7b4]">
                    {val > 0 ? `+${val}` : val} dB
                  </span>

                  <input
                    type="range"
                    min={-12}
                    max={12}
                    step={1}
                    value={val}
                    onChange={e => handleBandChange(cfg.key, Number(e.target.value))}
                    className="h-24 w-2 bg-white/[0.12] rounded-lg appearance-none cursor-pointer accent-[#d4af37] [writing-mode:vertical-lr] [direction:rtl]"
                  />

                  <div className="text-center mt-2">
                    <span className="text-[10px] sm:text-[11px] font-bold text-white block tracking-tight">{cfg.label}</span>
                    <span className="text-[9px] font-mono text-neutral-400 block">{cfg.freq}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Safe Pre-Amp Volume Booster Section */}
        <div className="bg-white/[0.03] border border-[#d4af37]/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#d4af37]" />
              <span className="text-xs font-semibold text-white tracking-wide">
                Volume Overdrive
              </span>
              <span className="text-xs font-mono text-[#f7e7b4] font-bold">
                {Math.round(volumeBoost * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/[0.1] border border-emerald-500/25 text-emerald-400 text-[10px] font-medium">
              <ShieldCheck className="w-3 h-3" />
              <span>Limiter Guard Active</span>
            </div>
          </div>

          <input
            type="range"
            min={1.0}
            max={2.0}
            step={0.05}
            value={volumeBoost}
            onChange={e => handleBoostChange(Number(e.target.value))}
            className="w-full h-2 bg-white/[0.12] rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
          />

          <p className="text-[10px] text-neutral-400 leading-tight">
            * Hardware Dynamics Compressor prevents acoustic clipping and protects phone speakers during amplification.
          </p>
        </div>
      </div>
    </div>
  );
};
