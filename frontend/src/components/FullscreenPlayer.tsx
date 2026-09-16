import React, { useEffect } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX,
  Sliders,
  Sparkles
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { KaushikBadge } from './KaushikBadge';

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const FullscreenPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    isRepeat,
    fullscreenOpen,
    setFullscreenOpen,
    setEqualizerOpen,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    nextTrack,
    prevTrack,
    toggleShuffle,
    toggleRepeat
  } = usePlayer();

  const { isLiked, toggleLike } = useLibrary();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreenOpen) {
        setFullscreenOpen(false);
      }
      if (e.code === 'Space' && fullscreenOpen) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenOpen, setFullscreenOpen, togglePlay]);

  if (!fullscreenOpen || !currentTrack) return null;

  const thumbnail = currentTrack.thumbnails?.[currentTrack.thumbnails.length - 1]?.url ||
    currentTrack.thumbnails?.[0]?.url ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600';

  const artistName = currentTrack.artists?.map(a => a.name).join(', ') || 'KAUSIC Artist';
  const liked = isLiked(currentTrack.videoId);

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col justify-between px-5 sm:px-10 pt-[max(env(safe-area-inset-top,16px),16px)] pb-[max(env(safe-area-inset-bottom,20px),20px)] select-none overflow-hidden font-sans animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Subtle Ambient Radial Glow */}
      <div
        className="absolute inset-0 opacity-15 filter blur-3xl scale-110 pointer-events-none transition-all duration-700"
        style={{
          backgroundImage: `url(${thumbnail})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-xl mx-auto">
        <button
          onClick={() => setFullscreenOpen(false)}
          className="p-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white border border-white/[0.08] active:scale-95 transition-all"
          title="Minimize"
        >
          <ChevronDown className="w-5 h-5 text-[#f7e7b4]" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] font-mono tracking-widest text-[#d4af37] uppercase font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#f7e7b4]" />
            NOW STREAMING
          </span>
          <span className="text-xs font-semibold text-neutral-300 truncate max-w-[200px]">
            {currentTrack.album?.name || 'Crystal Acoustics'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEqualizerOpen(true)}
            className="p-2.5 rounded-full glass-pill-gold hover:bg-white/[0.12] text-[#f7e7b4] border border-[#d4af37]/30 active:scale-95 transition-all"
            title="Open Equalizer DSP"
          >
            <Sliders className="w-4 h-4 text-[#d4af37]" />
          </button>
        </div>
      </div>

      {/* Center Artwork: Rotating Luxury Vinyl Acrylic Disc */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-auto py-2">
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-[#121216] via-[#1a1916] to-[#0a0a0d] border-4 border-[#d4af37]/30 shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(212,175,55,0.15)] flex items-center justify-center p-3">
          {/* Concentric Grooves */}
          <div className="absolute inset-4 rounded-full border border-white/[0.04]" />
          <div className="absolute inset-8 rounded-full border border-white/[0.03]" />
          <div className="absolute inset-12 rounded-full border border-white/[0.04]" />

          {/* Center Album Art Thumbnail */}
          <div className={`relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-2 border-[#d4af37]/60 shadow-2xl ${
            isPlaying ? 'animate-spin-slow' : ''
          }`}>
            <img
              src={thumbnail}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
            {/* Center Gold Spindle */}
            <div className="absolute inset-0 m-auto w-7 h-7 rounded-full bg-gradient-to-tr from-[#d4af37] via-[#f7e7b4] to-[#aa8214] border-2 border-black shadow flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-black" />
            </div>
          </div>
        </div>

        {/* Track Title & Artist */}
        <div className="text-center w-full max-w-sm mt-6 px-2 space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate drop-shadow-[0_2px_10px_rgba(212,175,55,0.25)]">
            {currentTrack.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#f7e7b4]/80 font-medium truncate">
            {artistName}
          </p>
        </div>
      </div>

      {/* Bottom Controls Console */}
      <div className="relative z-10 w-full max-w-md mx-auto space-y-4">
        {/* Scrubber Slider */}
        <div className="space-y-1.5">
          <div className="relative flex items-center py-1">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={e => seek(Number(e.target.value))}
              className="w-full h-1.5 bg-white/[0.12] rounded-lg appearance-none cursor-pointer accent-[#d4af37] hover:h-2 transition-all shadow-[0_0_10px_rgba(212,175,55,0.3)]"
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-[#f7e7b4]/80 px-0.5">
            <span>{formatTime(currentTime)}</span>
            <span className="text-neutral-500">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Primary Playback Action Controls */}
        <div className="flex items-center justify-between px-2">
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-full transition-colors ${
              isShuffle ? 'text-[#d4af37] drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]' : 'text-neutral-400 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={prevTrack}
            className="p-2.5 rounded-full text-neutral-200 hover:text-[#f7e7b4] active:scale-90 transition-all"
            title="Previous Track"
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </button>

          {/* Large Gold Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#d4af37] via-[#f7e7b4] to-[#c59e2a] hover:brightness-110 active:scale-95 text-black flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.6)] font-bold transition-all"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-black text-black" />
            ) : (
              <Play className="w-7 h-7 fill-black text-black translate-x-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-2.5 rounded-full text-neutral-200 hover:text-[#f7e7b4] active:scale-90 transition-all"
            title="Next Track"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-2 rounded-full transition-colors ${
              isRepeat !== 'off' ? 'text-[#d4af37] drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]' : 'text-neutral-400 hover:text-white'
            }`}
            title={`Repeat: ${isRepeat.toUpperCase()}`}
          >
            {isRepeat === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Bottom Utility Bar: Like + Volume Slider */}
        <div className="flex items-center justify-between pt-1 px-3">
          <button
            onClick={() => toggleLike(currentTrack)}
            className="p-2 rounded-full hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-all"
            title="Like"
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-1 rounded-full text-neutral-400 hover:text-white"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#f7e7b4]" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="w-24 h-1 bg-white/[0.15] rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
            />
          </div>

          <KaushikBadge variant="modal" />
        </div>
      </div>
    </div>
  );
};
