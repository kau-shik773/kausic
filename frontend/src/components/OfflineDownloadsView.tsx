import React, { useEffect, useState } from 'react';
import { DownloadCloud, Trash2, Play, HardDrive, CheckCircle2, Loader2 } from 'lucide-react';
import type { Track } from '../types';
import { offlineStorage } from '../services/offlineStorage';
import { usePlayer } from '../context/PlayerContext';

export const OfflineDownloadsView: React.FC = () => {
  const [downloadedTracks, setDownloadedTracks] = useState<Track[]>([]);
  const [storageMB, setStorageMB] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { playTrack } = usePlayer();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const tracks = await offlineStorage.getDownloadedTracks();
      const mb = await offlineStorage.getTotalStorageMB();
      setDownloadedTracks(tracks);
      setStorageMB(mb);
    } catch (err) {
      console.error('Failed to load offline tracks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await offlineStorage.deleteSong(videoId);
    await loadData();
  };

  const handleClearAll = async () => {
    if (confirm('Clear all downloaded offline music?')) {
      for (const t of downloadedTracks) {
        await offlineStorage.deleteSong(t.videoId);
      }
      await loadData();
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Banner */}
      <div className="flex items-end justify-between glass-panel-gold p-6 rounded-3xl border border-[#d4af37]/30 shadow-xl">
        <div className="flex items-end gap-5">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-[#d4af37] via-[#f7e7b4] to-[#c59e2a] flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.4)] text-black">
            <DownloadCloud className="w-12 h-12 sm:w-14 sm:h-14 text-black" />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-mono font-bold text-[#f7e7b4] uppercase tracking-widest">
              Offline Storage Vault
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Offline Music</h1>
            <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> {downloadedTracks.length} Songs Downloaded
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-[#d4af37]" /> {storageMB} MB Used
              </span>
            </div>
          </div>
        </div>

        {downloadedTracks.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => playTrack(downloadedTracks[0], downloadedTracks)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f7e7b4] to-[#c59e2a] hover:brightness-110 text-black font-bold text-sm shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-black" /> Play Offline
            </button>
            <button
              onClick={handleClearAll}
              className="p-2.5 rounded-full bg-neutral-900 hover:bg-rose-950/80 border border-neutral-800 hover:border-rose-500/50 text-neutral-400 hover:text-rose-400 transition-colors"
              title="Clear All Downloads"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Song List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-neutral-500 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#d4af37]" />
          <span className="font-mono text-xs">Querying IndexedDB Offline Vault...</span>
        </div>
      ) : downloadedTracks.length > 0 ? (
        <div className="glass-panel-gold rounded-2xl border border-[#d4af37]/20 p-2 divide-y divide-white/[0.05]">
          {downloadedTracks.map((track, i) => {
            const thumb = track.thumbnails?.[0]?.url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80';
            const artist = track.artists?.map(a => a.name).join(', ') || 'Unknown Artist';

            return (
              <div
                key={track.videoId}
                onClick={() => playTrack(track, downloadedTracks)}
                className="group flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer"
              >
                <div className="w-6 text-center text-xs font-mono text-neutral-500">
                  {i + 1}
                </div>

                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-neutral-800 shadow border border-[#d4af37]/15">
                  <img src={thumb} alt={track.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#f7e7b4] transition-colors">
                    {track.title}
                  </h4>
                  <p className="text-xs text-neutral-400 truncate mt-0.5">
                    {artist}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono">
                    OFFLINE
                  </span>

                  <button
                    onClick={(e) => handleDelete(track.videoId, e)}
                    className="p-2 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition-colors"
                    title="Delete downloaded song"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center text-neutral-500 text-sm space-y-2">
          <DownloadCloud className="w-12 h-12 text-[#d4af37]/40 mx-auto animate-pulse" />
          <p className="font-semibold text-neutral-400">No songs saved offline yet.</p>
          <p className="text-xs text-neutral-600">
            Click the download icon on any song to save it for zero-internet playback!
          </p>
        </div>
      )}
    </div>
  );
};
