import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  Heart,
  Loader2,
  Maximize2
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';

export const PlayerBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    isLoadingStream,
    togglePlay,
    nextTrack,
    setFullscreenOpen
  } = usePlayer();

  const { isLiked, toggleLike } = useLibrary();

  // If no song is loaded, keep bottom clean and zero clutter
  if (!currentTrack) {
    return null;
  }

  const liked = isLiked(currentTrack.videoId);
  const thumbnail = currentTrack.thumbnails?.[0]?.url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120';
  const artistName = currentTrack.artists?.map(a => a.name).join(', ') || 'KAUSIC Artist';
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div className="relative rounded-2xl glass-panel-gold border border-[#d4af37]/35 shadow-[0_16px_40px_rgba(0,0,0,0.95)] overflow-hidden backdrop-blur-2xl select-none animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Top Hairline Audio Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-white/[0.08] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#d4af37] via-[#f7e7b4] to-[#d4af37] transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="px-3 py-2 flex items-center justify-between gap-3">
        {/* Left: Rotating Disc Thumbnail & Title (Tapping expands Fullscreen Player) */}
        <div
          onClick={() => setFullscreenOpen(true)}
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
        >
          {/* Circular Vinyl Acrylic Disc */}
          <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-[#d4af37]/40 shadow-lg bg-black flex items-center justify-center">
            <img
              src={thumbnail}
              alt={currentTrack.title}
              className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
            />
            {/* Center Spindle Gold Dot */}
            <div className="absolute w-3 h-3 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#f7e7b4] border border-black shadow" />
          </div>

          {/* Track Info & Equalizer Animation */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white truncate group-hover:text-[#f7e7b4] transition-colors">
                {currentTrack.title}
              </h4>
              {/* Live Audio Equalizer Wavelet */}
              {isPlaying && (
                <div className="flex items-end gap-0.5 h-3 shrink-0">
                  <span className="w-0.5 h-2.5 bg-[#d4af37] rounded-full animate-bounce" />
                  <span className="w-0.5 h-3 bg-[#f7e7b4] rounded-full animate-pulse" />
                  <span className="w-0.5 h-1.5 bg-[#d4af37] rounded-full animate-bounce delay-75" />
                </div>
              )}
            </div>
            <p className="text-[10px] text-neutral-400 truncate mt-0.5 font-medium">
              {artistName}
            </p>
          </div>
        </div>

        {/* Right Controls: Like + Play/Pause + Next */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Like Button */}
          <button
            onClick={() => toggleLike(currentTrack)}
            className="p-2 rounded-full text-neutral-400 hover:text-white active:scale-95 transition-all"
            title="Like Track"
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {/* Main Play/Pause Button */}
          <button
            onClick={togglePlay}
            disabled={isLoadingStream}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#d4af37] via-[#f7e7b4] to-[#c59e2a] flex items-center justify-center text-black shadow-[0_0_15px_rgba(212,175,55,0.45)] hover:brightness-110 active:scale-90 transition-all disabled:opacity-50"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isLoadingStream ? (
              <Loader2 className="w-5 h-5 animate-spin text-black" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 fill-black text-black" />
            ) : (
              <Play className="w-4 h-4 fill-black text-black translate-x-0.5" />
            )}
          </button>

          {/* Next Button */}
          <button
            onClick={nextTrack}
            className="p-2 rounded-full text-neutral-300 hover:text-[#f7e7b4] active:scale-95 transition-all"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          {/* Expand Fullscreen Button */}
          <button
            onClick={() => setFullscreenOpen(true)}
            className="p-2 rounded-full text-neutral-400 hover:text-white active:scale-95 transition-all"
            title="Expand"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
