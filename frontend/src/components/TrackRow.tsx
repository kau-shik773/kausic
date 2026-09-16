import React, { useState, useEffect } from 'react';
import { Play, Radio, Heart, Plus, DownloadCloud, Check, Loader2 } from 'lucide-react';
import type { Track } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { offlineStorage } from '../services/offlineStorage';
import { fetchApi } from '../config/api';

interface TrackRowProps {
  track: Track;
  index?: number;
  showIndex?: boolean;
  queueContext?: Track[];
}

export const TrackRow: React.FC<TrackRowProps> = ({ track, index = 0, showIndex = true, queueContext }) => {
  const { playTrack, startRadio, currentTrack } = usePlayer();
  const { isLiked, toggleLike, playlists, addTrackToPlaylist } = useLibrary();
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    offlineStorage.isDownloaded(track.videoId).then(setIsDownloaded);
  }, [track.videoId]);

  const isCurrent = currentTrack?.videoId === track.videoId;
  const liked = isLiked(track.videoId);
  const thumbnail = track.thumbnails?.[0]?.url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80';
  const artistName = track.artists?.map(a => a.name).join(', ') || 'Unknown Artist';
  const albumName = track.album?.name || '-';

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
    <div
      onClick={() => playTrack(track, queueContext)}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/[0.06] transition-all select-none cursor-pointer ${
        isCurrent ? 'bg-white/[0.08] border border-[#d4af37]/35 text-[#f7e7b4] shadow-[0_4px_16px_rgba(212,175,55,0.2)]' : 'text-neutral-300'
      }`}
    >
      {/* Index or Play Button */}
      {showIndex && (
        <div className="w-5 sm:w-6 text-center shrink-0 flex items-center justify-center">
          <span className={`text-xs font-mono group-hover:hidden ${isCurrent ? 'text-[#f7e7b4] font-bold' : 'text-neutral-500'}`}>
            {index + 1}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); playTrack(track, queueContext); }}
            className="hidden group-hover:flex items-center justify-center text-white hover:text-[#d4af37] active:scale-90 transition-transform"
            title="Play"
          >
            <Play className="w-4 h-4 fill-current" />
          </button>
        </div>
      )}

      {/* Artwork */}
      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-neutral-900 border border-[#d4af37]/20 shadow">
        <img src={thumbnail} alt={track.title} className="w-full h-full object-cover" loading="lazy" />
      </div>

      {/* Title & Artist (Takes full available width) */}
      <div className="flex-1 min-w-0 pr-2">
        <h4 className={`text-xs sm:text-sm font-semibold truncate block ${isCurrent ? 'text-[#f7e7b4] font-bold' : 'text-white'}`}>
          {track.title}
        </h4>
        <p className="text-[11px] text-neutral-400 truncate block mt-0.5 font-medium">
          {artistName}
        </p>
      </div>

      {/* Album (desktop only) */}
      <div className="hidden lg:block w-1/4 text-xs text-neutral-400 truncate font-medium">
        {albumName}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
        {/* Offline Download Button (Tablet & Desktop) */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`hidden sm:flex p-1.5 rounded-full transition-all ${
            isDownloaded
              ? 'text-emerald-400'
              : isDownloading
              ? 'text-[#d4af37] animate-spin'
              : 'text-neutral-400 hover:text-white hover:bg-white/[0.08]'
          }`}
          title={isDownloaded ? "Downloaded Offline" : "Download Offline"}
        >
          {isDownloaded ? <Check className="w-4 h-4" /> : isDownloading ? <Loader2 className="w-4 h-4" /> : <DownloadCloud className="w-4 h-4" />}
        </button>

        {/* Like Button */}
        <button
          onClick={() => toggleLike(track)}
          className={`p-1.5 rounded-full hover:bg-white/[0.08] transition-all ${
            liked ? 'text-rose-500' : 'text-neutral-400 hover:text-white'
          }`}
          title={liked ? "Unlike" : "Like"}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Radio Button (Desktop only) */}
        <button
          onClick={() => startRadio(track)}
          className="hidden md:flex p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-all"
          title="Start Radio"
        >
          <Radio className="w-4 h-4" />
        </button>

        {/* Add to playlist dropdown (Desktop only) */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowPlaylistMenu(prev => !prev)}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-all"
            title="Add to Playlist"
          >
            <Plus className="w-4 h-4" />
          </button>

          {showPlaylistMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 glass-panel-gold border border-[#d4af37]/30 rounded-2xl shadow-2xl p-1.5 z-40 text-xs">
              <div className="px-3 py-1.5 font-bold text-[#f7e7b4] border-b border-white/[0.08]">
                Add to Playlist
              </div>
              {playlists.map(pl => (
                <button
                  key={pl.id}
                  onClick={() => {
                    addTrackToPlaylist(pl.id, track);
                    setShowPlaylistMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/[0.08] text-neutral-200 truncate font-medium"
                >
                  {pl.name}
                </button>
              ))}
              {playlists.length === 0 && (
                <div className="px-3 py-2 text-neutral-400 italic">No playlists created</div>
              )}
            </div>
          )}
        </div>

        {/* Duration */}
        <span className="w-9 sm:w-12 text-right text-xs font-mono text-neutral-400">
          {track.duration || '3:30'}
        </span>
      </div>
    </div>
  );
};
