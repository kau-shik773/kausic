import React, { useState, useEffect } from 'react';
import { Play, Radio, Heart, DownloadCloud, Check, Loader2 } from 'lucide-react';
import type { Track } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { offlineStorage } from '../services/offlineStorage';
import { fetchApi } from '../config/api';

interface TrackCardProps {
  track: Track;
  queueContext?: Track[];
}

export const TrackCard: React.FC<TrackCardProps> = ({ track, queueContext }) => {
  const { playTrack, startRadio, currentTrack, isPlaying } = usePlayer();
  const { isLiked, toggleLike } = useLibrary();
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    offlineStorage.isDownloaded(track.videoId).then(setIsDownloaded);
  }, [track.videoId]);

  const isCurrent = currentTrack?.videoId === track.videoId;
  const thumbnail = track.thumbnails?.[track.thumbnails.length - 1]?.url ||
    track.thumbnails?.[0]?.url ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300';

  const artistName = track.artists?.map(a => a.name).join(', ') || 'Unknown Artist';
  const liked = isLiked(track.videoId);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloaded || isDownloading) return;

    setIsDownloading(true);
    try {
      const data = await fetchApi<{ stream_url: string }>(`/stream?id=${track.videoId}`);
      if (data.stream_url) {
        const audioRes = await fetch(data.stream_url);
        const blob = await audioRes.blob();
        await offlineStorage.saveSong(track, blob);
        setIsDownloaded(true);
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={`group relative p-2.5 sm:p-3 rounded-2xl transition-all duration-300 flex flex-col glass-card select-none ${
      isCurrent
        ? 'ring-1 ring-[#d4af37]/60 bg-white/[0.08] shadow-[0_8px_25px_rgba(212,175,55,0.25)]'
        : 'hover:bg-white/[0.06]'
    }`}>
      {/* Artwork Container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white/[0.04] mb-2.5 shadow-md border border-[#d4af37]/15">
        <img
          src={thumbnail}
          alt={track.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Hover Overlay & Action Controls */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 sm:gap-2 backdrop-blur-sm">
          <button
            onClick={() => toggleLike(track)}
            className="p-2 rounded-full glass-pill-gold text-white hover:scale-110 active:scale-95 transition-all"
            title={liked ? "Unlike" : "Like"}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          <button
            onClick={() => playTrack(track, queueContext)}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f7e7b4] to-[#c59e2a] text-black flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.6)] hover:scale-110 active:scale-95 transition-transform font-bold"
            title="Play"
          >
            <Play className="w-4 h-4 fill-black ml-0.5" />
          </button>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="p-2 rounded-full glass-pill-gold text-white hover:scale-110 active:scale-95 transition-all"
            title={isDownloaded ? "Downloaded" : "Download Offline"}
          >
            {isDownloaded ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 text-[#d4af37] animate-spin" />
            ) : (
              <DownloadCloud className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={() => startRadio(track)}
            className="p-2 rounded-full glass-pill-gold text-white hover:scale-110 active:scale-95 transition-all"
            title="Start Radio"
          >
            <Radio className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Playing Indicator */}
        {isCurrent && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#d4af37] text-black text-[9px] font-black tracking-wider uppercase shadow-md">
            {isPlaying ? 'ACTIVE' : 'PAUSED'}
          </div>
        )}
      </div>

      {/* Metadata */}
      <h3 className={`font-semibold text-xs sm:text-sm truncate ${isCurrent ? 'text-[#f7e7b4] font-bold' : 'text-white'}`} title={track.title}>
        {track.title}
      </h3>
      <p className="text-[11px] text-neutral-400 truncate mt-0.5 font-medium" title={artistName}>
        {artistName}
      </p>
    </div>
  );
};
